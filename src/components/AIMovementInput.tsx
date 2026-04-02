import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mic, MicOff, ImagePlus, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type MovementData = {
  productName?: string;
  type?: string;
  quantity?: number;
  batch?: string;
  locationOrigin?: string;
  locationDestiny?: string;
  notes?: string;
  operator?: string;
};

type AIInputProps = {
  onDataExtracted: (data: MovementData) => void;
};

type ProcessingState = "idle" | "recording" | "processing" | "success" | "error";

export function AIMovementInput({ onDataExtracted }: AIInputProps) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [state, setState] = useState<ProcessingState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setState("idle");
    setStatusMessage("");
    setTranscript("");
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await processVoice(blob);
      };

      mediaRecorder.start();
      setState("recording");
      setStatusMessage("Gravando... Descreva a movimentação.");
      setDialogOpen(true);
    } catch {
      toast({ title: "Erro ao acessar microfone", description: "Verifique as permissões do navegador.", variant: "destructive" });
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setState("processing");
    setStatusMessage("Transcrevendo áudio...");
  }, []);

  const processVoice = async (blob: Blob) => {
    try {
      const buffer = await blob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((s, b) => s + String.fromCharCode(b), "")
      );

      // Step 1: Transcribe
      const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke(
        "transcribe-audio",
        { body: { audio: base64, mimeType: "audio/webm" } }
      );

      if (transcribeError) throw transcribeError;
      const text = transcribeData.transcript;
      setTranscript(text);
      setStatusMessage("Extraindo dados com IA...");

      // Step 2: Extract movement data
      const { data: extractData, error: extractError } = await supabase.functions.invoke(
        "process-movement-ai",
        { body: { type: "voice", content: text } }
      );

      if (extractError) throw extractError;
      handleSuccess(extractData.movement);
    } catch (e: any) {
      handleError(e.message || "Erro ao processar áudio");
    }
  };

  const handleFileUpload = async (file: File, inputType: "image" | "pdf") => {
    setDialogOpen(true);
    setState("processing");
    setStatusMessage(`Analisando ${inputType === "pdf" ? "documento" : "imagem"} com IA...`);

    try {
      const buffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((s, b) => s + String.fromCharCode(b), "")
      );

      const { data, error } = await supabase.functions.invoke("process-movement-ai", {
        body: { type: inputType, content: base64, mimeType: file.type },
      });

      if (error) throw error;
      handleSuccess(data.movement);
    } catch (e: any) {
      handleError(e.message || `Erro ao processar ${inputType}`);
    }
  };

  const handleSuccess = (movementData: MovementData) => {
    setState("success");
    setStatusMessage("Dados extraídos com sucesso!");
    onDataExtracted(movementData);
    setTimeout(() => {
      setDialogOpen(false);
      reset();
    }, 1500);
  };

  const handleError = (message: string) => {
    setState("error");
    setStatusMessage(message);
    toast({ title: "Erro no processamento", description: message, variant: "destructive" });
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={startRecording}
          className="gap-2"
          title="Registrar por voz"
        >
          <Mic className="h-4 w-4" />
          <span className="hidden sm:inline">Voz</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
          title="Registrar por imagem"
        >
          <ImagePlus className="h-4 w-4" />
          <span className="hidden sm:inline">Imagem</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => pdfInputRef.current?.click()}
          className="gap-2"
          title="Registrar por PDF"
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">PDF</span>
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file, "image");
            e.target.value = "";
          }}
        />
        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file, "pdf");
            e.target.value = "";
          }}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { if (state === "recording") stopRecording(); else { setDialogOpen(false); reset(); } } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {state === "recording" ? "Gravando Áudio" : state === "processing" ? "Processando com IA" : state === "success" ? "Sucesso!" : state === "error" ? "Erro" : "IA"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-6">
            {state === "recording" && (
              <>
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center animate-pulse">
                    <Mic className="h-10 w-10 text-destructive" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">{statusMessage}</p>
                <Button variant="destructive" onClick={stopRecording} className="gap-2">
                  <MicOff className="h-4 w-4" /> Parar Gravação
                </Button>
              </>
            )}

            {state === "processing" && (
              <>
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground text-center">{statusMessage}</p>
                {transcript && (
                  <div className="w-full rounded-md bg-muted p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Transcrição:</p>
                    <p className="text-sm">"{transcript}"</p>
                  </div>
                )}
              </>
            )}

            {state === "success" && (
              <>
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <p className="text-sm text-center font-medium">{statusMessage}</p>
              </>
            )}

            {state === "error" && (
              <>
                <AlertCircle className="h-12 w-12 text-destructive" />
                <p className="text-sm text-center text-destructive">{statusMessage}</p>
                <Button variant="outline" onClick={reset}>Tentar novamente</Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
