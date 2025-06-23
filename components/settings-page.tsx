import { ApiDebugPanel } from "@/components/api-debug-panel"
import { Separator } from "@/components/ui/separator"

export function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      {/* Existing settings cards would go here */}
      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium">API Testing & Debug</h3>
        <ApiDebugPanel />
      </div>
    </div>
  )
}
