"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface CountdownTimerProps {
  expiresAt: string
}

export default function CountdownTimer({ expiresAt }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    minutes: number
    seconds: number
    expired: boolean
  }>({ minutes: 0, seconds: 0, expired: false })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const expiry = new Date(expiresAt).getTime()
      const difference = expiry - now

      if (difference <= 0) {
        return { minutes: 0, seconds: 0, expired: true }
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      return { minutes, seconds, expired: false }
    }

    // Calculate initial time
    setTimeLeft(calculateTimeLeft())

    // Set up interval to update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    // Cleanup interval on component unmount
    return () => clearInterval(timer)
  }, [expiresAt])

  if (timeLeft.expired) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-semibold text-destructive mb-2">Order Expired</h3>
            <p className="text-sm text-muted-foreground">
              This order has expired and is likely cancelled. Please contact staff if you have any questions.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isUrgent = timeLeft.minutes < 5
  const formatTime = (num: number) => num.toString().padStart(2, "0")

  return (
    <div className="text-center">
      <div
        className={`inline-flex items-center justify-center w-32 h-16 rounded-lg border-2 ${
          isUrgent ? "border-destructive bg-destructive/5 text-destructive" : "border-primary bg-primary/5 text-primary"
        }`}
      >
        <span className="text-2xl font-mono font-bold">
          {formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
        </span>
      </div>
      <p className={`text-sm mt-2 ${isUrgent ? "text-destructive" : "text-muted-foreground"}`}>
        {isUrgent ? "⚠️ Order expires soon!" : "Minutes remaining"}
      </p>
    </div>
  )
}
