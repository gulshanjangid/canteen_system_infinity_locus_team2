import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">The page you're looking for doesn't exist or the order ID is invalid.</p>
          <Button asChild className="w-full">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Back to Menu
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
