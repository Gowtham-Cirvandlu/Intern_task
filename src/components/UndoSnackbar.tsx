import { Snackbar, Button } from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;      // should reset lastDeletedTask + isDeleted
  onUndo: () => void;
}

export default function UndoSnackbar({ open, onClose, onUndo }: Props) {

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    // Ignore clickaway so user can still undo
    if (reason === 'clickaway') return;

    onClose(); // IMPORTANT: clears lastDeletedTask & isDeleted
  };

  const handleUndo = () => {
    if (!open) return; // prevent undo after snackbar closed
    onUndo();
    onClose(); // cleanup state immediately after undo
  };

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      autoHideDuration={4000}
      message="Task deleted"
      action={
        <Button
          color="secondary"
          size="small"
          onClick={handleUndo}
        >
          Undo
        </Button>
      }
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    />
  );
}
