import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card.tsx";
import FileUpload from "@/components/share/UploadFile.tsx";
import {useState} from "react";
import {toast} from "sonner";
import Loader from "@/components/share/Loader.tsx";
import {jocClientRead, jocConfig, jpaWalletClient} from "@/lib/wagmi.ts";
import {useAccount, useSwitchChain} from "wagmi";
import {STORE_VOUCHERS} from "@/lib/contracts.ts";
import {STORE_VOUCHERS_ABI} from "@/lib/abis/STORE_VOUCHERS_ABI.ts";
import {uploadFileToIPFS, uploadJsonToIPFS} from "@/lib/ipfs.ts";

const formSchema = z.object({
    title: z.string().min(2).max(50),
    image: z.any().refine(val => val !== null, {message: "Image is required"}),
});

const CreateStore = () => {
    const {chainId, address} = useAccount()
    const {switchChain} = useSwitchChain()

    const [isLoadingCreate, setIsLoadingCreate] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            image: null,
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (chainId !== jocConfig.id) {
            toast.error('Please connect to JOC Testnet!')
            return
        }

        try {
            setIsLoadingCreate(true);

            let uploadedImg = null
            if (values.image) {
                uploadedImg = await uploadFileToIPFS(values.image)
            }
            const uploadedJson = await uploadJsonToIPFS({
                imgUrl: uploadedImg !== null ? uploadedImg?.pinataURL : '',
            });

            const {request} = await jocClientRead.simulateContract({
                address: STORE_VOUCHERS,
                abi: STORE_VOUCHERS_ABI,
                functionName: 'createStore',
                args: [values.title, uploadedJson?.pinataURL],
                account: address,
            })
            const hash = await jpaWalletClient!.writeContract(request)
            await jocClientRead.waitForTransactionReceipt({hash: hash})

            toast(
                <div className={'flex flex-col'}>
                    <div>
                        Transaction is in progress.
                    </div>
                    <div>
                        {hash}
                    </div>
                </div>
            )
            form.reset()
            setIsLoadingCreate(false);
        } catch (e) {
            console.log(e)
            setIsLoadingCreate(false);
            toast.error("Error!");
        }
    };

    return (
        <Card className={"mx-0 bg-gray-100 dark:bg-gray-900"}>
            <CardHeader>
                <CardTitle>Create new store</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Title" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="image"
                            render={({field}) => (
                                <FormItem className={""}>
                                    <div className={"mt-0 w-full"}>
                                        <FormControl className={""}>
                                            <div className={"relative"}>
                                                {field.value !== null && (
                                                    <img
                                                        className={
                                                            "h-64 w-full rounded-md object-cover object-center"
                                                        }
                                                        src={URL.createObjectURL(field.value)}
                                                        alt=""
                                                    />
                                                )}
                                                <FileUpload
                                                    {...field}
                                                    file={field.value}
                                                    setFile={field.onChange}
                                                />
                                            </div>
                                        </FormControl>
                                    </div>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        {address !== undefined && chainId !== jocConfig.id
                            ? <div className={"flex items-center justify-end"}>
                                <Button onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    switchChain({chainId: jocConfig.id})
                                }}>
                                    Switch to JOC
                                </Button>
                            </div>
                            : <div className={"flex items-center justify-end"}>
                                <Button disabled={isLoadingCreate} type="submit">
                                    {isLoadingCreate && (<Loader/>)}
                                    Create store
                                </Button>
                            </div>
                        }
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default CreateStore;
