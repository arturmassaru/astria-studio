"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

const MAX_IMAGES = 6;
const MAX_SIDE = 1000; // px: reduz o peso para caber no armazenamento do navegador (modo demonstração)

/** Lê o arquivo, reduz e converte para JPEG (data URL). */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Arquivo de imagem inválido."));
      img.onload = () => {
        const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Seu navegador não conseguiu processar a imagem."));
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function ImageUploader({
  images,
  onChange,
  label = "Imagens",
}: {
  images: string[];
  onChange: (next: string[]) => void;
  label?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    const room = MAX_IMAGES - images.length;
    if (room <= 0) return setError(`Limite de ${MAX_IMAGES} imagens por item.`);
    const chosen = Array.from(files).slice(0, room);
    const invalid = chosen.find((f) => !f.type.startsWith("image/"));
    if (invalid) return setError("Envie apenas arquivos de imagem (JPG, PNG, WebP).");
    setBusy(true);
    try {
      const urls = await Promise.all(chosen.map(fileToDataUrl));
      onChange([...images, ...urls]);
      if (files.length > room) setError(`Só cabem ${MAX_IMAGES} imagens; as extras foram ignoradas.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao processar a imagem.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      <p className="mb-1 text-sm font-medium">{label}</p>
      <p className="mb-3 text-xs text-muted">
        A primeira imagem é a capa. Fotos em pé (proporção 2:3 ou 3:4) ficam melhores na loja. Até {MAX_IMAGES} imagens.
      </p>

      {images.length > 0 ? (
        <ul className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((src, i) => (
            <li key={`${i}-${src.slice(-24)}`} className="rounded-xl border border-stone bg-white p-2">
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-sand">
                <Image src={src} alt={`Imagem ${i + 1}`} fill sizes="200px" unoptimized className="object-cover" />
                {i === 0 ? (
                  <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-[0.7rem] text-cream">Capa</span>
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap justify-between gap-1">
                <Button variant="ghost" className="px-2! py-1! text-xs" disabled={i === 0} onClick={() => move(i, i - 1)}>
                  ← <span className="sr-only">Mover imagem {i + 1} para a esquerda</span>
                </Button>
                <Button
                  variant="ghost"
                  className="px-2! py-1! text-xs"
                  disabled={i === images.length - 1}
                  onClick={() => move(i, i + 1)}
                >
                  → <span className="sr-only">Mover imagem {i + 1} para a direita</span>
                </Button>
                <Button
                  variant="ghost"
                  className="px-2! py-1! text-xs"
                  onClick={() => onChange(images.filter((_, j) => j !== i))}
                >
                  Remover<span className="sr-only"> imagem {i + 1}</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <label
        htmlFor={inputId}
        className="inline-flex cursor-pointer items-center rounded-full border border-ink/30 px-5 py-2.5 text-sm font-medium hover:border-ink hover:bg-sand focus-within:ring-2 focus-within:ring-ink"
      >
        {busy ? "Processando…" : images.length > 0 ? "Adicionar mais imagens" : "Escolher imagens"}
      </label>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-red-900">
          {error}
        </p>
      ) : null}
      <p className="mt-3 text-xs text-muted">
        Modo demonstração: as imagens ficam salvas só neste navegador. Com o Supabase conectado, elas irão para o armazenamento
        online.
      </p>
    </div>
  );
}
