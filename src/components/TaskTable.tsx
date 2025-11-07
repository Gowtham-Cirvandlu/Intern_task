import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { DerivedTask, Task } from "@/types";
import TaskForm from "@/components/TaskForm";
import TaskDetailsDialog from "@/components/TaskDetailsDialog";
import { formatROI } from "@/utils/logic";
import ActionPopup from "@/components/ActionPopup";

interface Props {
  tasks: DerivedTask[];
  onAdd: (payload: Omit<Task, "id">) => void;
  onUpdate: (id: string, patch: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

// confirm-before-delete popup
type PendingConfirm = { type: "delete"; task: Task } | null;

export default function TaskTable({ tasks, onAdd, onUpdate, onDelete }: Props) {
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [details, setDetails] = useState<Task | null>(null);

  // delete confirm popup
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null);

  // post-save popup (after editing)
  const [postMsg, setPostMsg] = useState<string | null>(null);

  const existingTitles = useMemo(() => tasks.map((t) => t.title), [tasks]);

  const handleAddClick = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const handleEditClick = (task: Task) => {
    setEditing(task);
    setOpenForm(true);
  };

  const handleDeleteClick = (task: Task) => {
    setPendingConfirm({ type: "delete", task });
  };

  // Build a human-friendly diff summary after save
  function buildChangeSummary(before: Task, patch: Partial<Task>) {
    const after: Task = { ...before, ...patch } as Task;
    const parts: string[] = [];

    if (patch.title !== undefined && before.title !== after.title) {
      parts.push(`Title: “${before.title}” → “${after.title}”`);
    }
    if (patch.revenue !== undefined && before.revenue !== after.revenue) {
      parts.push(`Revenue: ${before.revenue} → ${after.revenue}`);
    }
    if (patch.timeTaken !== undefined && before.timeTaken !== after.timeTaken) {
      parts.push(`Time: ${before.timeTaken}h → ${after.timeTaken}h`);
    }
    if (patch.priority !== undefined && before.priority !== after.priority) {
      parts.push(`Priority: ${before.priority} → ${after.priority}`);
    }
    if (patch.status !== undefined && before.status !== after.status) {
      parts.push(`Status: ${before.status} → ${after.status}`);
    }
    if (patch.notes !== undefined && before.notes !== after.notes) {
      parts.push(`Notes updated`);
    }

    return parts.length
      ? `You changed: ${parts.join(", ")}`
      : `No visible changes.`;
  }

  const handleSubmit = (value: Omit<Task, "id"> & { id?: string }) => {
    if (value.id) {
      // EDIT: compute diff vs. current task, update, then show post-save popup
      const before = tasks.find((t) => t.id === value.id) as Task | undefined;
      const { id, ...patch } = value as Task;
      onUpdate(id, patch);

      if (before) {
        const msg = buildChangeSummary(before, patch);
        // close form then show popup (next frame helps focus with MUI modal)
        requestAnimationFrame(() => {
          setOpenForm(false);
          setPostMsg(msg);
        });
      } else {
        // fallback: no before state found
        requestAnimationFrame(() => {
          setOpenForm(false);
          setPostMsg("Changes saved.");
        });
      }
    } else {
      // ADD
      onAdd(value as Omit<Task, "id">);
      setOpenForm(false);
    }
  };

  const scrollToActivity = () => {
    const el = document.getElementById("activity-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Post-save popup OK → scroll to activity
  const handlePostOk = () => {
    setPostMsg(null);
    scrollToActivity();
  };

  const handleConfirmOk = () => {
    if (!pendingConfirm) return;
    if (pendingConfirm.type === "delete") {
      onDelete(pendingConfirm.task.id);
    }
    setPendingConfirm(null);
    scrollToActivity();
  };

  const handleConfirmClose = () => setPendingConfirm(null);

  return (
    <Card>
      <CardContent>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h6" fontWeight={700}>
            Tasks
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={handleAddClick}
          >
            Add Task
          </Button>
        </Stack>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell align="right">Revenue</TableCell>
                <TableCell align="right">Time (h)</TableCell>
                <TableCell align="right">ROI</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((t) => (
                <TableRow
                  key={t.id}
                  hover
                  onClick={() => setDetails(t)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography fontWeight={600}>{t.title}</Typography>
                      {t.notes && (
                        // NOTE: consider sanitizing if notes can contain HTML.
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          title={t.notes}
                          dangerouslySetInnerHTML={{
                            __html: t.notes as unknown as string,
                          }}
                        />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    ${t.revenue.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">{t.timeTaken}</TableCell>
                  <TableCell align="right">{formatROI(t.roi, 2)}</TableCell>
                  <TableCell>{t.priority}</TableCell>
                  <TableCell>{t.status}</TableCell>
                  <TableCell
                    align="right"
                    onClick={(e) => e.stopPropagation()} // prevent opening View from actions cell
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            (e.currentTarget as HTMLElement).blur();
                            requestAnimationFrame(() => handleEditClick(t));
                          }}
                          onKeyDown={(e) => e.stopPropagation()}
                          size="small"
                          aria-label="Edit task"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            (e.currentTarget as HTMLElement).blur();
                            requestAnimationFrame(() => handleDeleteClick(t));
                          }}
                          onKeyDown={(e) => e.stopPropagation()}
                          size="small"
                          color="error"
                          aria-label="Delete task"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {tasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box py={6} textAlign="center" color="text.secondary">
                      No tasks yet. Click "Add Task" to get started.
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>

      {/* Edit form */}
      <TaskForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleSubmit}
        existingTitles={existingTitles}
        initial={editing}
      />

      {/* View details */}
      <TaskDetailsDialog
        open={!!details}
        task={details}
        onClose={() => setDetails(null)}
        onSave={onUpdate}
      />

      {/* Post-save popup (Edit) */}
      <ActionPopup
        open={!!postMsg}
        title="Changes saved"
        message={postMsg ?? ""}
        onOk={handlePostOk}
        onClose={() => setPostMsg(null)}
      />

      {/* Confirm popup (Delete) */}
      <ActionPopup
        open={!!pendingConfirm}
        title="Delete Task"
        message={
          pendingConfirm
            ? `You are about to delete "${pendingConfirm.task.title}".`
            : ""
        }
        onOk={handleConfirmOk}
        onClose={handleConfirmClose}
      />
    </Card>
  );
}
