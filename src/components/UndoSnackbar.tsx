import { Snackbar, Button } from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  onUndo: () => void;
}

export default function UndoSnackbar({ open, onClose, onUndo }: Props) {
  return (
    <Snackbar
      open={open}
      onClose={onClose}
      autoHideDuration={4000}
      message="Task deleted"
      action={<Button color="secondary" size="small" onClick={()=>{   // bug 2 this line updated
        onUndo(); onClose();
      }}>Undo</Button>}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    />
  );
}


