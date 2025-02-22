"use client";

import type React from "react";
import { useState } from "react";
import {
  Bitcoin,
  Wallet,
  Zap,
  CheckCircle,
  Smartphone,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { QRCodeDialog } from "./qr-code-dialog";
import { StepItem } from "./step-item";

// Mock functions (same as before)
const fetchUTXOs = async (address: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return [
    {
      txid: "da326a5fdfa2251c7cdb6f8288f2173c8c528466a47bfc529dae5b08cc1d8896",
      n: 0,
      balance: Math.floor(Math.random() * 10 ** 9),
    },
  ];
};

const generateLightningInvoice = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return "lnbc1500n1ps36h3upp5cjuqkzjuddvj5c8tx5w3wfwnnwln7kkj7vgkcyrlc3m7atjd6xsdq8w3jhxaqcqzpgxqyz5vqsp5usz0h9pc8pzcl4ws3e3cn6l3cjz2jt9d9mwsc3kf3ysjzgavyxs9qyyssqy8jjmwl3xkgzjqmx4wl07jyj8zgh2gqvgukvlnlkpsylgxjznz5l9yl7cj0gs5x9t8589jg9d8y5jsev7k4l9xsvxlh8rnl5zv5kzgpvxq7uz";
};

const connectHardwareWallet = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return true;
};

const signTransactions = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return true;
};

const fetchUnsignedTransactions = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return [
    {
      id: 1,
      from: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      to: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
      amount: 0.1,
    },
    {
      id: 2,
      from: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      to: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
      amount: 0.05,
    },
  ];
};

export default function BitcoinWatchTower() {
  const [watchAddress, setWatchAddress] = useState("");
  const [recoveryAddress, setRecoveryAddress] = useState("");
  const [transactionCount, setTransactionCount] = useState("");
  const [maxFee, setMaxFee] = useState("");
  const [utxos, setUtxos] = useState<
    {
      txid: string;
      n: number;
      balance: number;
    }[]
  >([]);
  const [fetchedUtXOs, setFetchedUTXOs] = useState(false);
  const [invoice, setInvoice] = useState("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isQRCodeDialogOpen, setIsQRCodeDialogOpen] = useState(false);
  const [isSoftwareWalletDialogOpen, setIsSoftwareWalletDialogOpen] =
    useState(false);
  const [unsignedTransactions, setUnsignedTransactions] = useState<any[]>([]);
  const [signedTransaction, setSignedTransaction] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [whitelistAddresses, setWhitelistAddresses] = useState("");

  const isStepCompleted = (step: number) => completedSteps.includes(step);
  const isStepActive = (step: number) => currentStep === step;

  const handleStepClick = (step: number) => {
    if (step <= Math.max(...completedSteps, currentStep)) {
      setCurrentStep(step);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFetchUTXOs = async () => {
    if (watchAddress) {
      const result = await fetchUTXOs(watchAddress);
      setUtxos(result);
      // setCompletedSteps((prev) => [...new Set([...prev, 2])]);
      setFetchedUTXOs(true);
    }
  };

  const handleGenerateInvoice = async () => {
    const newInvoice = await generateLightningInvoice();
    setInvoice(newInvoice);
    setIsQRCodeDialogOpen(true);
  };

  const handleConnectWallet = async () => {
    const connected = await connectHardwareWallet();
    setIsWalletConnected(connected);
    if (connected) {
      setCompletedSteps((prev) => [...new Set([...prev, 4])]);
      handleNextStep();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isWalletConnected || signedTransaction) {
      const signed = await signTransactions();
      if (signed) {
        setIsSuccess(true);
        setCompletedSteps((prev) => [...new Set([...prev, 4])]);
      }
    }
  };

  const handlePaymentSuccess = () => {
    setIsQRCodeDialogOpen(false);
    setCompletedSteps((prev) => [...new Set([...prev, 2])]);
    handleNextStep();
  };

  const handleSoftwareWallet = async () => {
    const transactions = await fetchUnsignedTransactions();
    setUnsignedTransactions(transactions);
    setIsSoftwareWalletDialogOpen(true);
  };

  const handleSoftwareWalletSubmit = () => {
    setIsSoftwareWalletDialogOpen(false);
    if (signedTransaction) {
      setCompletedSteps((prev) => [...new Set([...prev, 3])]);
      handleNextStep();
    }
  };

  const handleStepOne = async () => {
    await fetch("/api/address", {
      method: "POST",
      body: JSON.stringify({
        watchAddress: watchAddress,
        utxos,
        recoveryAddress: recoveryAddress,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    setCompletedSteps((prev) => [...new Set([...prev, 1])]);
    handleNextStep();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="watchAddress">Watch Address</Label>
              <Input
                id="watchAddress"
                value={watchAddress}
                onChange={(e) => setWatchAddress(e.target.value)}
                placeholder="Enter Bitcoin address to watch"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="recoveryAddress">Recovery Address</Label>
              <Input
                id="recoveryAddress"
                value={recoveryAddress}
                onChange={(e) => setRecoveryAddress(e.target.value)}
                placeholder="Enter recovery address"
                className="mt-1"
              />
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="transactionCount">Transaction Count</Label>
                <Input
                  id="transactionCount"
                  type="number"
                  value={transactionCount}
                  onChange={(e) => setTransactionCount(e.target.value)}
                  placeholder="Number of transactions to sign"
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="maxFee">Max Fee (satoshis)</Label>
                <Input
                  id="maxFee"
                  type="number"
                  value={maxFee}
                  onChange={(e) => setMaxFee(e.target.value)}
                  placeholder="Maximum fee"
                  className="mt-1"
                />
              </div>
            </div>
            <Button
              onClick={handleFetchUTXOs}
              className="w-full bg-blue-500 hover:bg-blue-600"
              disabled={
                !watchAddress ||
                !recoveryAddress ||
                !transactionCount ||
                !maxFee
              }
            >
              Fetch UTXOs
            </Button>
            {fetchedUtXOs && (
              <div>
                <div className="mt-6 mb-2 space-y-2">
                  <div className="flex items-center justify-between py-3 px-4 bg-blue-50 rounded-lg">
                    <span className="text-gray-600 font-medium">
                      Number of UTXOs:
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {utxos.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 px-4 bg-blue-50 rounded-lg">
                    <span className="text-gray-600 font-medium">
                      Total Balance:
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {((utxos[0]?.balance ?? 0) / 10 ** 8).toFixed(8)} BTC
                    </span>
                  </div>
                </div>
                <Button
                  onClick={handleStepOne}
                  disabled={
                    !watchAddress ||
                    !recoveryAddress ||
                    !transactionCount ||
                    !maxFee
                  }
                  className="w-full mt-4"
                >
                  Next Step <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div>
            <div className="bg-blue-50 rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-semibold  mb-4">
                Previous Step Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="">Watch Address</span>
                  <span className="font-semibold px-3 py-1 rounded">
                    {watchAddress}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="">Recovery Address</span>
                  <span className="font-semibold px-3 py-1 rounded">
                    {recoveryAddress}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="">Total Balance</span>
                  <span className="font-semibold px-3 py-1 rounded">
                    {((utxos[0]?.balance ?? 0) / 10 ** 8).toFixed(8)} BTC
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="">Transaction Count</span>
                  <span className="font-semibold px-3 py-1 rounded">
                    {transactionCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="">Max Fee</span>
                  <span className="font-semibold px-3 py-1 rounded">
                    {maxFee} satoshis
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={handleGenerateInvoice}
              className="w-full bg-yellow-500 hover:bg-yellow-600"
            >
              <Zap className="mr-2" /> Generate Lightning Invoice
            </Button>
          </div>
        );
      case 3:
        return (
          <div>
            <div className="mb-4 p-4 bg-blue-50 rounded">
              <h3 className="font-semibold mb-2">Sign your transactions:</h3>
              <p>
                Choose how you are going to sign your transactions, we do not
                hold your private key
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-2 gap-2">
              <Button
                onClick={handleConnectWallet}
                className={`flex-1 ${
                  isWalletConnected
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-500 hover:bg-gray-600"
                }`}
              >
                <Wallet className="mr-2" />
                {isWalletConnected
                  ? "Hardware Wallet Connected"
                  : "Connect Hardware Wallet"}
              </Button>
              <Button
                onClick={handleSoftwareWallet}
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                <Smartphone className="mr-2" />
                Software Wallet
              </Button>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <div className="mb-4 p-4 rounded">
              <h3 className="font-semibold mb-2">
                Recieve notifications for robbery attempts:
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="telegram">Telegram (optional)</Label>
                  <Input
                    id="telegram"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="Enter your Telegram username"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="whitelistAddresses">
                    Whitelist Addresses (optional)
                  </Label>
                  <Textarea
                    id="whitelistAddresses"
                    value={whitelistAddresses}
                    onChange={(e) => setWhitelistAddresses(e.target.value)}
                    placeholder="Enter whitelist addresses, one per line"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Submit Transactions
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white shadow-lg">
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-2xl font-bold flex items-center">
            <Bitcoin className="mr-2" /> Bitcoin Watch Tower
          </CardTitle>
          <CardDescription className="text-blue-100">
            Protect your Bitcoin with our watch tower service
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <div className="grid sm:flex justify-between mb-8">
            <StepItem
              stepNumber={1}
              title="Addresses"
              isActive={isStepActive(1)}
              isCompleted={isStepCompleted(1)}
              onClick={() => handleStepClick(1)}
            />
            <StepItem
              stepNumber={2}
              title="Pay Invoice"
              isActive={isStepActive(2)}
              isCompleted={isStepCompleted(2)}
              onClick={() => handleStepClick(2)}
            />
            <StepItem
              stepNumber={3}
              title="Sign Tx"
              isActive={isStepActive(3)}
              isCompleted={isStepCompleted(3)}
              onClick={() => handleStepClick(3)}
            />
            <StepItem
              stepNumber={4}
              title="Submit"
              isActive={isStepActive(4)}
              isCompleted={isStepCompleted(4)}
              onClick={() => handleStepClick(4)}
            />
          </div>

          {renderStepContent()}
        </CardContent>
        {isSuccess && (
          <CardContent className="mt-4 bg-green-100 border-t border-green-200 place-items-center pt-6">
            <div className="flex items-center text-green-700">
              <CheckCircle className="mr-2" />
              <p>Success! Your watch tower service is now active.</p>
            </div>
          </CardContent>
        )}
      </Card>

      <QRCodeDialog
        isOpen={isQRCodeDialogOpen}
        onClose={() => setIsQRCodeDialogOpen(false)}
        invoice={invoice}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <Dialog
        open={isSoftwareWalletDialogOpen}
        onOpenChange={setIsSoftwareWalletDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Software Wallet</DialogTitle>
            <DialogDescription>
              Review and sign the unsigned transactions below.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <h4 className="font-medium mb-2">Unsigned Transactions:</h4>
            <ul className="space-y-2">
              {unsignedTransactions.map((tx) => (
                <li key={tx.id} className="text-sm">
                  From: {tx.from.slice(0, 10)}... To: {tx.to.slice(0, 10)}...
                  Amount: {tx.amount} BTC
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <Label htmlFor="signedTransaction">Signed Transaction</Label>
            <Textarea
              id="signedTransaction"
              value={signedTransaction}
              onChange={(e) => setSignedTransaction(e.target.value)}
              placeholder="Paste your signed transaction here"
              className="mt-1"
            />
          </div>
          <Button
            onClick={handleSoftwareWalletSubmit}
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600"
            disabled={!signedTransaction}
          >
            Add Signed Transactions
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
