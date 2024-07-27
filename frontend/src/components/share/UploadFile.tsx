import {FC, useRef} from "react";
import {Button} from "@/components/ui/button.tsx";
import {UploadIcon} from "lucide-react";

type FileUploadProps = {
    file: File | null;
    setFile: (x: File | null) => void;
    classNames?: string;
}

const FileUpload: FC<FileUploadProps> = ({file, setFile}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleFileInputClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        fileInputRef?.current?.click();
    };

    const handleClearFile = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return <>
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{display: "none"}}
        />
        <div className={"mt-2 flex gap-2"}>
            <Button
                variant={"secondary"}
                size={"sm"}
                onClick={handleFileInputClick}
            >
                <UploadIcon size={15} className={"mr-2"}/>
                Upload Image
            </Button>

            {file && (
                <Button
                    size={"sm"}
                    variant={"destructive"}
                    onClick={handleClearFile}
                >
                    Remove
                </Button>
            )}
        </div>
    </>
};

export default FileUpload;
