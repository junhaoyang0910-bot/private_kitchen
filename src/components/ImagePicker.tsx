import { ImagePlus } from "lucide-react";
import { useRef, useState } from "react";
import { placeholderImage } from "../data/mockRecipes";
import { fileToCompressedDataUrl } from "../lib/image";

type ImagePickerProps = {
  imageDataUrl?: string;
  onChange: (imageDataUrl: string) => void;
};

export default function ImagePicker({ imageDataUrl, onChange }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件。");
      return;
    }

    try {
      const nextImage = await fileToCompressedDataUrl(file);
      onChange(nextImage);
      setError("");
    } catch {
      setError("图片读取失败，请换一张试试。");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <section className="image-picker">
      <img src={imageDataUrl || placeholderImage} alt="菜品预览" />
      <input ref={inputRef} accept="image/*" hidden type="file" onChange={handleFileChange} />
      <button className="secondary-button image-picker__button" type="button" onClick={() => inputRef.current?.click()}>
        <ImagePlus size={18} />
        选择图片
      </button>
      {error ? <p className="form-error">{error}</p> : null}
    </section>
  );
}
