import React, { useState } from 'react'
import { Button } from '../ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx'
import { FileText, BarChart3, Lightbulb, Download, Package } from '../icons'
import { downloadFile, downloadMultipleFiles } from '../../utils/downloadUtils.js'

const ResourcesView = ({ handleSelectCheatSheet, handleShowMatrix }) => {
  const [downloading, setDownloading] = useState(null)
  const cheatSheets = [
    { name: "ChatGPT Cheat Sheet", file: "ChatGPT_Cheat_Sheet.md" },
    { name: "Claude Cheat Sheet", file: "Claude_Cheat_Sheet.md" },
    { name: "Gemini Cheat Sheet", file: "Gemini_Cheat_Sheet.md" },
    { name: "Perplexity Cheat Sheet", file: "Perplexity_Cheat_Sheet.md" },
    { name: "Manus Cheat Sheet", file: "Manus_Cheat_Sheet.md" },
    { name: "Zapier Cheat Sheet", file: "Zapier_Cheat_Sheet.md" },
    { name: "n8n Cheat Sheet", file: "n8n_Cheat_Sheet.md" },
  ]

  const promptPacks = [
    { name: "Sales Prompts", file: "Sales.md" },
    { name: "Marketing Prompts", file: "Growth.md" },
    { name: "Support Prompts", file: "Support.md" },
    { name: "HR Prompts", file: "HR.md" },
    { name: "Finance Prompts", file: "Finance.md" },
    { name: "Operations SOPs", file: "Ops_SOPs.md" },
    { name: "Product Analytics", file: "Product_Analytics.md" },
    { name: "Automation Agents", file: "Automation_Agents.md" },
  ]

  const handleDownload = async (file, displayName) => {
    try {
      setDownloading(file)
      await downloadFile(file, displayName)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  const handleDownloadAllCheatSheets = async () => {
    try {
      setDownloading('all-cheat-sheets')
      await downloadMultipleFiles(
        cheatSheets.map(sheet => ({ fileName: sheet.file, displayName: sheet.name })),
        'cheat-sheets.zip'
      )
    } catch (error) {
      console.error('Bulk download failed:', error)
      alert('Bulk download failed. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  const handleDownloadAllPrompts = async () => {
    try {
      setDownloading('all-prompts')
      await downloadMultipleFiles(
        promptPacks.map(pack => ({ fileName: pack.file, displayName: pack.name })),
        'prompt-packs.zip'
      )
    } catch (error) {
      console.error('Bulk download failed:', error)
      alert('Bulk download failed. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Resources & Tools</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Cheat Sheets
            </CardTitle>
            <CardDescription>Quick reference guides</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cheatSheets.map((sheet) => (
                <div key={sheet.name} className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 justify-start text-left"
                    onClick={() => handleSelectCheatSheet(sheet.file)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {sheet.name}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(sheet.file, `${sheet.name}.md`)}
                    disabled={downloading === sheet.file}
                  >
                    {downloading === sheet.file ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
              <div className="pt-2 border-t">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleDownloadAllCheatSheets}
                  disabled={downloading === 'all-cheat-sheets'}
                >
                  {downloading === 'all-cheat-sheets' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2" />
                      Downloading All...
                    </>
                  ) : (
                    <>
                      <Package className="mr-2 h-4 w-4" />
                      Download All Cheat Sheets
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Capability Matrices
            </CardTitle>
            <CardDescription>Compare platforms and features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-left" onClick={() => handleShowMatrix("Capability_Matrix_LLM_Assistants.csv")}>
                <Download className="mr-2 h-4 w-4" />
                LLM Assistants Matrix
              </Button>
              <Button variant="outline" className="w-full justify-start text-left" onClick={() => handleShowMatrix("Capability_Matrix_Automation.csv")}>
                <Download className="mr-2 h-4 w-4" />
                Automation Platforms Matrix
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Prompt Packs
            </CardTitle>
            <CardDescription>Ready-to-use prompts by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {promptPacks.map((pack) => (
                <Button
                  key={pack.name}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleDownload(pack.file, `${pack.name}.md`)}
                  disabled={downloading === pack.file}
                >
                  {downloading === pack.file ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  {pack.name}
                </Button>
              ))}
              <div className="pt-2 border-t">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleDownloadAllPrompts}
                  disabled={downloading === 'all-prompts'}
                >
                  {downloading === 'all-prompts' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2" />
                      Downloading All...
                    </>
                  ) : (
                    <>
                      <Package className="mr-2 h-4 w-4" />
                      Download All Prompt Packs
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResourcesView