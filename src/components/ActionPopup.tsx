import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface ActionPopupProps {
  open: boolean;
  title: string;
  message: string;
  onOk: () => void;
  onClose: () => void;
}

export default function ActionPopup({
  open,
  title,
  message,
  onOk,
  onClose,
}: ActionPopupProps) {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="action-popup-title">
      <DialogTitle id="action-popup-title">{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body1">{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onOk} autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
