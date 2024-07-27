import {createRoot} from "react-dom/client";
import {Providers} from "@/components/share/Providers.tsx";
import "@rainbow-me/rainbowkit/styles.css";
import "./global.css";

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
    const root = createRoot(rootElement);
    root.render(<Providers/>);
}
