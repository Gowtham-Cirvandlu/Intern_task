import {
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";

export interface ActivityItem {
  id: string;
  ts: number;
  type: "add" | "update" | "delete" | "undo";
  summary: string;
  /** Optional structured details to render as a list (e.g., ["Title: A → B", "Revenue: 10 → 20"]) */
  details?: string[];
}

interface Props {
  items: ActivityItem[];
}

export default function ActivityLog({ items }: Props) {
  return (
    <Card id="activity-section">
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Activity
        </Typography>
        <List dense>
          {items.length === 0 && (
            <ListItem>
              <ListItemText primary="No recent activity" />
            </ListItem>
          )}

          {items.map((a) => {
            let formattedSummary = a.summary;

            // ✅ Improve DELETE summary: show title + id if present
            if (a.type === "delete") {
              let titleMatch = a.summary.match(/Deleted[: ]+"?([^"]+)"?/i);
              let idMatch = a.summary.match(/t-[A-Za-z0-9]+/i);

              const title = titleMatch?.[1];
              const id = idMatch?.[0];

              if (id && title) {
                formattedSummary = `Deleted "${title}" having id ${id}`;
              } else if (id) {
                formattedSummary = `Deleted task having id ${id}`;
              }
            }

            // ========== DETAIL PARSING FOR UPDATE ==========
            let parsed: string[] = [];
            if (!a.details) {
              const m = a.summary.match(/^(Edited:|Updated:)\s*(.*)$/i);
              if (m && m[2]) {
                parsed = m[2]
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
              }
            }
            const detailsToShow =
              a.details && a.details.length > 0 ? a.details : parsed;

            return (
              <ListItem key={a.id} divider>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="flex-start"
                  sx={{ width: "100%" }}
                >
                  <Chip
                    size="small"
                    label={a.type.toUpperCase()}
                    color={
                      a.type === "delete"
                        ? "error"
                        : a.type === "add"
                        ? "success"
                        : "default"
                    }
                    variant="outlined"
                  />

                  <Stack sx={{ flex: 1 }}>
                    <ListItemText
                      primary={formattedSummary}
                      secondary={new Date(a.ts).toLocaleString()}
                    />

                    {detailsToShow.length > 0 && (
                      <Stack
                        component="ul"
                        sx={{ pl: 2.5, mt: 0.25, mb: 0 }}
                        spacing={0.25}
                      >
                        {detailsToShow.map((d, i) => (
                          <Typography
                            key={i}
                            component="li"
                            variant="body2"
                            color="text.secondary"
                          >
                            {d}
                          </Typography>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Stack>
              </ListItem>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
}
