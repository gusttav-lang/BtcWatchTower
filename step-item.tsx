import { CheckCircle } from "lucide-react"

interface StepItemProps {
  stepNumber: number
  title: string
  isActive: boolean
  isCompleted: boolean
  onClick: () => void
}

export function StepItem({ stepNumber, title, isActive, isCompleted, onClick }: StepItemProps) {
  return (
    <div
      className={`flex items-center cursor-pointer ${isActive ? "text-blue-600" : "text-gray-500"}`}
      onClick={onClick}
    >
      <div
        className={`flex items-center justify-center w-8 h-8 border-2 rounded-full mr-2 
        ${isActive ? "border-blue-600" : isCompleted ? "border-green-500 bg-green-500" : "border-gray-300"}`}
      >
        {isCompleted ? (
          <CheckCircle className="w-5 h-5 text-white" />
        ) : (
          <span className={`text-sm ${isActive ? "text-blue-600" : "text-gray-500"}`}>{stepNumber}</span>
        )}
      </div>
      <span className={`text-sm ${isCompleted ? "text-green-500" : ""}`}>{title}</span>
    </div>
  )
}

