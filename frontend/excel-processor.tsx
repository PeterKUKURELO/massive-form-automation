"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Upload, CheckCircle, XCircle, ToggleRight, ToggleLeft, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

const formSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Debe ser un archivo Excel (.xlsx)",
    ),
})

interface Registro {
  index: number
  nombre: string
  success: boolean
  error?: string
}

export default function ExcelProcessor() {
  const [total, setTotal] = useState(0)
  const [registros, setRegistros] = useState<Registro[]>([])
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [headless, setHeadless] = useState(true)
  const [errores, setErrores] = useState<Registro[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const handleUpload = async (file: File) => {
    setIsProcessing(true)
    setRegistros([])
    setProgress(0)
    setTotal(0)
    setErrores([])

    const formData = new FormData()
    formData.append("file", file)
    formData.append("headless", headless.toString())

    const response = await fetch("http://localhost:8000/upload/", {
      method: "POST",
      body: formData,
    })

    if (!response.body) {
      console.error("No response body found")
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split("\n\n")
      buffer = parts.pop() || ""

      for (let part of parts) {
        if (part.startsWith("data: ")) {
          const json = part.replace("data: ", "").trim()
          const parsed = JSON.parse(json)

          if (parsed.total) {
            setTotal(parsed.total)
          } else {
            setRegistros((prev) => [...prev, parsed])

            // Aquí el fix para el Infinity%
            setProgress(total > 0 ? ((parsed.index) / total) * 100 : 0)

            if (!parsed.success) {
              setErrores((prev) => [...prev, parsed])
            }
          }
        }
      }
    }

    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 dark:from-rose-950 dark:via-pink-950 dark:to-rose-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="text-center flex-1 space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Procesador de Excel en Tiempo Real
            </h1>
            <p className="text-rose-700 dark:text-rose-300">
              Sube tu archivo Excel y observa el procesamiento en vivo
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Upload Card */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-rose-950/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Subir Archivo Excel
            </CardTitle>
            <CardDescription className="text-rose-100">
              Selecciona un archivo Excel (.xlsx) para procesar los registros
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-rose-700 dark:text-rose-300">Archivo Excel</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".xlsx"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleUpload(file)
                              field.onChange(file)
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>

            <div className="mt-4 flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setHeadless((prev) => !prev)}
                disabled={isProcessing}
              >
                {headless ? (
                  <>
                    <ToggleLeft className="w-4 h-4 mr-2" /> Headless ACTIVADO
                  </>
                ) : (
                  <>
                    <ToggleRight className="w-4 h-4 mr-2" /> Headless DESACTIVADO
                  </>
                )}
              </Button>
              {total > 0 && (
                <span className="text-sm text-muted-foreground">Total registros: {total}</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Progress Card */}
        {isProcessing && (
          <Card>
            <CardHeader>
              <CardTitle>Procesando Registros...</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="h-4" />
              <div className="mt-4 text-sm text-muted-foreground">{Math.round(progress)}%</div>
            </CardContent>
          </Card>
        )}

        {/* Resultados */}
        {registros.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {registros.map((registro) => (
                <motion.div
                  key={registro.index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-white dark:bg-rose-900 rounded-lg border"
                >
                  <div>{registro.nombre}</div>
                  {registro.success ? (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="h-4 w-4 mr-1" /> OK
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500 text-white">
                      <XCircle className="h-4 w-4 mr-1" /> Error
                    </Badge>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Errores */}
        {errores.length > 0 && (
          <Card className="border-l-4 border-l-red-500 bg-white/90 dark:bg-rose-950/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                Errores detectados
              </CardTitle>
              <CardDescription>Registros que fallaron durante el envío</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {errores.map((err) => (
                  <Alert key={err.index} variant="destructive" className="border-red-200 dark:border-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{err.nombre}</strong>: {err.error}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Peter Kukurelo */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center py-6">
          <div className="flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400">
            <span className="text-sm font-medium">
              Sistema generado por <span className="font-bold text-rose-700 dark:text-rose-300">Peter Kukurelo</span>
            </span>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
