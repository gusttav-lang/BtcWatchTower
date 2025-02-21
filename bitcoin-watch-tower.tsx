"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Bitcoin, Wallet, Zap, CheckCircle, Smartphone, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { QRCodeDialog } from "./qr-code-dialog"
import { StepItem } from "./step-item"

// Mock functions (same as before)
const fetchUTXOs = async (address: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return {
    count: Math.floor(Math.random() * 10) + 1,
    balance: Math.random() * 10,
  }
}

const generateLightningInvoice = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return "lnbc1500n1ps36h3upp5cjuqkzjuddvj5c8tx5w3wfwnnwln7kkj7vgkcyrlc3m7atjd6xsdq8w3jhxaqcqzpgxqyz5vqsp5usz0h9pc8pzcl4ws3e3cn6l3cjz2jt9d9mwsc3kf3ysjzgavyxs9qyyssqy8jjmwl3xkgzjqmx4wl07jyj8zgh2gqvgukvlnlkpsylgxjznz5l9yl7cj0gs5x9t8589jg9d8y5jsev7k4l9xsvxlh8rnl5zv5kzgpvxq7uz"
}

const connectHardwareWallet = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return true
}

const signTransactions = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return true
}

const fetchUnsignedTransactions = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return [
    { id: 1, from: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", to: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy", amount: 0.1 },
    {
      id: 2,
      from: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      to: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
      amount: 0.05,
    },
  ]
}

export default function BitcoinWatchTower() {
  const [watchAddress, setWatchAddress] = useState("")
  const [recoveryAddress, setRecoveryAddress] = useState("")
  const [transactionCount, setTransactionCount] = useState("")
  const [maxFee, setMaxFee] = useState("")
  const [utxos, setUtxos] = useState<{ count: number; balance: number } | null>(null)
  const [invoice, setInvoice] = useState("")
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isQRCodeDialogOpen, setIsQRCodeDialogOpen] = useState(false)
  const [isSoftwareWalletDialogOpen, setIsSoftwareWalletDialogOpen] = useState(false)
  const [unsignedTransactions, setUnsignedTransactions] = useState<any[]>([])
  const [signedTransaction, setSignedTransaction] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const isStepCompleted = (step: number) => completedSteps.includes(step)
  const isStepActive = (step: number) => currentStep === step

  useEffect(() => {
    if (watchAddress && recoveryAddress && transactionCount && maxFee) {
      setCompletedSteps((prev) => [...new Set([...prev, 1])])
    }
  }, [watchAddress, recoveryAddress, transactionCount, maxFee])

  const handleStepClick = (step: number) => {
    if (step <= Math.max(...completedSteps, currentStep)) {
      setCurrentStep(step)
    }
  }

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleFetchUTXOs = async () => {
    if (watchAddress) {
      const result = await fetchUTXOs(watchAddress)
      setUtxos(result)
      setCompletedSteps((prev) => [...new Set([...prev, 2])])
      handleNextStep()
    }
  }

  const handleGenerateInvoice = async () => {
    const newInvoice = await generateLightningInvoice()
    setInvoice(newInvoice)
    setIsQRCodeDialogOpen(true)
  }

  const handleConnectWallet = async () => {
    const connected = await connectHardwareWallet()
    setIsWalletConnected(connected)
    if (connected) {
      setCompletedSteps((prev) => [...new Set([...prev, 4])])
      handleNextStep()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isWalletConnected || signedTransaction) {
      const signed = await signTransactions()
      if (signed) {
        setIsSuccess(true)
        setCompletedSteps((prev) => [...new Set([...prev, 5])])
      }
    }
  }

  const handlePaymentSuccess = () => {
    setIsQRCodeDialogOpen(false)
    setCompletedSteps((prev) => [...new Set([...prev, 3])])
    handleNextStep()
  }

  const handleSoftwareWallet = async () => {
    const transactions = await fetchUnsignedTransactions()
    setUnsignedTransactions(transactions)
    setIsSoftwareWalletDialogOpen(true)
  }

  const handleSoftwareWalletSubmit = () => {
    setIsSoftwareWalletDialogOpen(false)
    if (signedTransaction) {
      setCompletedSteps((prev) => [...new Set([...prev, 4])])
      handleNextStep()
    }
  }

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
                  placeholder="Number of transactions"
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
              onClick={handleNextStep}
              disabled={!watchAddress || !recoveryAddress || !transactionCount || !maxFee}
              className="w-full mt-4"
            >
              Next Step <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      case 2:
        return (
          <div>
            <div className="mb-4 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold mb-2">Previous Step Summary:</h3>
              <p>Watch Address: {watchAddress}</p>
              <p>Recovery Address: {recoveryAddress}</p>
              <p>Transaction Count: {transactionCount}</p>
              <p>Max Fee: {maxFee} satoshis</p>
            </div>
            <Button onClick={handleFetchUTXOs} className="w-full bg-blue-500 hover:bg-blue-600">
              Fetch UTXOs
            </Button>
          </div>
        )
      case 3:
        return (
          <div>
            <div className="mb-4 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold mb-2">Previous Step Summary:</h3>
              <p>Number of UTXOs: {utxos?.count}</p>
              <p>Total Balance: {utxos?.balance.toFixed(8)} BTC</p>
            </div>
            <Button onClick={handleGenerateInvoice} className="w-full bg-yellow-500 hover:bg-yellow-600">
              <Zap className="mr-2" /> Generate Lightning Invoice
            </Button>
          </div>
        )
      case 4:
        return (
          <div>
            <div className="mb-4 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold mb-2">Previous Step Summary:</h3>
              <p>Lightning Invoice Generated and Paid</p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleConnectWallet}
                className={`flex-1 ${isWalletConnected ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"}`}
              >
                <Wallet className="mr-2" />
                {isWalletConnected ? "Hardware Wallet Connected" : "Connect Hardware Wallet"}
              </Button>
              <Button onClick={handleSoftwareWallet} className="flex-1 bg-purple-500 hover:bg-purple-600">
                <Smartphone className="mr-2" />
                Software Wallet
              </Button>
            </div>
          </div>
        )
      case 5:
        return (
          <div>
            <div className="mb-4 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold mb-2">Previous Step Summary:</h3>
              <p>{isWalletConnected ? "Hardware Wallet Connected" : "Software Wallet Used"}</p>
            </div>
            <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700">
              Submit and Sign Transactions
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white shadow-lg">
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-2xl font-bold flex items-center">
            <Bitcoin className="mr-2" /> Bitcoin Watch Tower
          </CardTitle>
          <CardDescription className="text-blue-100">Protect your Bitcoin with our watch tower service</CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <div className="flex justify-between mb-8">
            <StepItem
              stepNumber={1}
              title="Fill Inputs"
              isActive={isStepActive(1)}
              isCompleted={isStepCompleted(1)}
              onClick={() => handleStepClick(1)}
            />
            <StepItem
              stepNumber={2}
              title="Fetch UTXOs"
              isActive={isStepActive(2)}
              isCompleted={isStepCompleted(2)}
              onClick={() => handleStepClick(2)}
            />
            <StepItem
              stepNumber={3}
              title="Pay Invoice"
              isActive={isStepActive(3)}
              isCompleted={isStepCompleted(3)}
              onClick={() => handleStepClick(3)}
            />
            <StepItem
              stepNumber={4}
              title="Sign Tx"
              isActive={isStepActive(4)}
              isCompleted={isStepCompleted(4)}
              onClick={() => handleStepClick(4)}
            />
            <StepItem
              stepNumber={5}
              title="Submit"
              isActive={isStepActive(5)}
              isCompleted={isStepCompleted(5)}
              onClick={() => handleStepClick(5)}
            />
          </div>

          {renderStepContent()}
        </CardContent>
        {isSuccess && (
          <CardContent className="mt-4 bg-green-100 border-t border-green-200">
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

      <Dialog open={isSoftwareWalletDialogOpen} onOpenChange={setIsSoftwareWalletDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Software Wallet</DialogTitle>
            <DialogDescription>Review and sign the unsigned transactions below.</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <h4 className="font-medium mb-2">Unsigned Transactions:</h4>
            <ul className="space-y-2">
              {unsignedTransactions.map((tx) => (
                <li key={tx.id} className="text-sm">
                  From: {tx.from.slice(0, 10)}... To: {tx.to.slice(0, 10)}... Amount: {tx.amount} BTC
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
          <Button onClick={handleSoftwareWalletSubmit} className="mt-4 w-full">
            Submit Signed Transaction
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

