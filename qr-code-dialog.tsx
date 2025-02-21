import QRCode from "react-qr-code";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface QRCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: string;
  onPaymentSuccess: () => void;
}

export function QRCodeDialog({
  isOpen,
  onClose,
  invoice,
  onPaymentSuccess,
}: QRCodeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Scan QR Code to Pay</DialogTitle>
          <DialogDescription>
            Use your Lightning wallet to scan this QR code and pay the invoice.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          <QRCode value={invoice} size={256} />
          <p className="mt-4 text-sm text-gray-500 break-all">{invoice}</p>
          <Button onClick={onPaymentSuccess} className="mt-4 w-full">
            Pay
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
