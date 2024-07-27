import {ThemeProvider, useTheme} from "@/components/share/ThemeProvider.tsx";
import {WagmiProvider} from "wagmi";
import {config} from "@/lib/wagmi.ts";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {darkTheme, lightTheme, RainbowKitProvider,} from "@rainbow-me/rainbowkit";
import AppRouter from "@/components/share/AppRouter.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
});

export const Providers = () => {
    const {theme} = useTheme();
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitProvider
                        theme={theme === "dark" ? darkTheme() : lightTheme()}
                        coolMode
                        modalSize="compact"
                    >
                        <Toaster/>
                        <AppRouter/>
                    </RainbowKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </ThemeProvider>
    );
};
