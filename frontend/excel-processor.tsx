"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Upload,
    CheckCircle,
    XCircle,
    ToggleRight,
    ToggleLeft,
    AlertCircle,
} from "lucide-react"
import { motion } from "framer-motion"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

const formSchema = z.object({
    file: z.any().refine(
        (file) =>
            file &&
            typeof file === "object" &&
            "type" in file &&
            file.type ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        {
            message: "Debe ser un archivo Excel (.xlsx)",
        }
    ),
})

interface Registro {
    index: number
    nombre: string
    success: boolean
    error?: string
}

export default function ExcelProcessor() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [total, setTotal] = useState(0)
    const [registros, setRegistros] = useState<Registro[]>([])
    const [errores, setErrores] = useState<Registro[]>([])
    const [progress, setProgress] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false)
    const [headless, setHeadless] = useState(true)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    const handleUpload = async (file: File) => {
        if (isProcessing) return // 🔒 bloqueo duro

        setIsProcessing(true)
        setRegistros([])
        setErrores([])
        setProgress(0)
        setTotal(0)

        const formData = new FormData()
        formData.append("file", file)
        formData.append("headless", headless.toString())

        const response = await fetch("/api/upload/", {
            method: "POST",
            body: formData,
        })

        if (!response.body) {
            console.error("No response body")
            setIsProcessing(false)
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

            for (const part of parts) {
                if (!part.startsWith("data: ")) continue

                const parsed = JSON.parse(part.replace("data: ", ""))

                if (parsed.evento === "inicio") {
                    setTotal(parsed.total)
                }

                if (parsed.evento === "procesando") {
                    setProgress(
                        parsed.index && total > 0 ? (parsed.index / total) * 100 : 0
                    )
                }

                if (parsed.evento === "resultado") {
                    setRegistros((prev) => {
                        const newRegistros = [...prev, parsed]
                        // Verificar si se completó el procesamiento
                        if (newRegistros.length === total) {
                            alert(`✅ Procesamiento completado! ${newRegistros.length} registros procesados.`)
                        }
                        return newRegistros
                    })

                    if (!parsed.success) {
                        setErrores((prev) => [...prev, parsed])
                    }
                }

            }
        }

        setIsProcessing(false)
    }

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 dark:from-rose-950 dark:to-rose-900">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex-1 text-center space-y-2">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                            Procesador de Excel en Tiempo Real
                        </h1>
                        <p className="text-rose-700 dark:text-rose-300">
                            Sube tu archivo Excel y observa el procesamiento en vivo
                        </p>
                    </div>
                    <ThemeToggle />
                </div>

                {/* Upload */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            Subir archivo
                        </CardTitle>
                        <CardDescription>Archivo Excel (.xlsx)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <FormField
                                control={form.control}
                                name="file"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Archivo</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept=".xlsx"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        setSelectedFile(file)
                                                        field.onChange(file)
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </Form>

                        <div className="mt-4 flex items-center gap-4">
                            <Button
                                disabled={!selectedFile || isProcessing}
                                onClick={() => selectedFile && handleUpload(selectedFile)}
                            >
                                {isProcessing ? "Procesando..." : "Procesar archivo"}
                            </Button>

                            <Button
                                variant="outline"
                                disabled={isProcessing}
                                onClick={() => setHeadless((h) => !h)}
                            >
                                {headless ? (
                                    <>
                                        <ToggleLeft className="w-4 h-4 mr-2" />
                                        Headless ACTIVADO
                                    </>
                                ) : (
                                    <>
                                        <ToggleRight className="w-4 h-4 mr-2" />
                                        Headless DESACTIVADO
                                    </>
                                )}
                            </Button>

                            {total > 0 && (
                                <span className="text-sm text-muted-foreground">
                  Total registros: {total}
                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Progreso */}
                {isProcessing && (
                    <Card>
                        <CardContent className="space-y-2">
                            <Progress value={progress} />
                            <div className="text-sm">{Math.round(progress)}%</div>
                        </CardContent>
                    </Card>
                )}

                {/* Resultados */}
                {registros.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Resultados</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {registros.map((r) => (
                                <motion.div
                                    key={r.index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex justify-between p-3 border rounded"
                                >
                                    <span>{r.nombre}</span>
                                    {r.success ? (
                                        <Badge className="bg-green-500 text-white">
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            OK
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-red-500 text-white">
                                            <XCircle className="w-4 h-4 mr-1" />
                                            Error
                                        </Badge>
                                    )}
                                </motion.div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Errores */}
                {errores.length > 0 && (
                    <Card className="border-l-4 border-l-red-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="w-5 h-5" />
                                Errores detectados
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {errores.map((e) => (
                                <Alert key={e.index} variant="destructive">
                                    <AlertDescription>
                                        <strong>{e.nombre}</strong>: {e.error}
                                    </AlertDescription>
                                </Alert>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
