import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import FileUpload from "@/components/share/UploadFile.tsx";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Calendar} from "@/components/ui/calendar"
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover"
import {ChangeEvent, useEffect, useState} from "react";
import {toast} from "sonner";
import Loader from "@/components/share/Loader.tsx";
import {jocClientRead, jocConfig, jpaWalletClient} from "@/lib/wagmi.ts";
import {useAccount, useSwitchChain} from "wagmi";
import {CalendarIcon, XIcon} from "lucide-react";
import {UTCDate} from "@date-fns/utc";
import {cn} from "@/lib/utils.ts";
import {format} from "date-fns";
import {ERC_20_ABI} from "@/lib/abis/ERC_20_ABI.ts";
import {formatEther, parseEther} from "viem";
import {STORE_VOUCHERS} from "@/lib/contracts.ts";
import {STORE_VOUCHERS_ABI} from "@/lib/abis/STORE_VOUCHERS_ABI.ts";
import {useNavigate, useParams} from "react-router-dom";
import {uploadFileToIPFS, uploadJsonToIPFS} from "@/lib/ipfs.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {apiEncrypt} from "@/apis";
import globalStore from "@/store/globalStore.ts";
import {Tokens} from "@/lib/constants.ts";

const formSchema = z.object({
    title: z.string().min(2).max(50),
    description: z.string().min(2),
    image: z.any().refine(val => val !== null, {message: "Image is required"}),
    codes: z.string().array().min(1, {message: "At least one code is required"}),
    price: z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val), {message: "Price must be a number"})
        .refine((val) => val >= 1, {message: "Price must be at least 1"}),
    token: z.enum(["usdt", "jpy"], {message: "Invalid token!"}),
    isOtherToken: z.boolean(),
    expiration: z.date({
        required_error: "A date of birth is required.",
    }),
});

const CreateMarketItem = () => {
    const {storeId} = useParams()
    const {stores} = globalStore()
    const navigate = useNavigate()

    const {chainId, address} = useAccount()
    const {switchChain} = useSwitchChain()

    const [isLoadingCreate, setIsLoadingCreate] = useState(false);

    const [tokensBalance, setTokensBalance] = useState({
        "usdt": 0,
        "jpy": 0
    })


    const [hour, setHour] = useState<string>('00');
    const [minute, setMinute] = useState<string>('00');
    const [hourError, setHourError] = useState<string | null>(null);
    const [minuteError, setMinuteError] = useState<string | null>(null);
    const [minTimeError, setMinTimeError] = useState<string>('')
    const [isStoreOwner, setIsStoreOwner] = useState(false)
    const [isLoadingGetStore, setIsLoadingGetStore] = useState(true)
    const [codeValue, setCodeValue] = useState('')

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            image: null,
            price: '0' as any,
            codes: [],
            token: "usdt",
            isOtherToken: false,
            expiration: new UTCDate()
        },
    });

    const getBalance = async ({tokenName, tokenAddress}: {
        tokenName: string,
        tokenAddress: string
    }) => {
        try {
            const e: any = await jocClientRead.readContract({
                address: tokenAddress as any,
                abi: ERC_20_ABI,
                functionName: 'balanceOf',
                args: [address]
            })
            setTokensBalance(prev => ({
                ...prev,
                [tokenName]: formatEther(e)
            }))
            // setTokenAllowanceValue(formatEther(e))
        } catch (e) {
            console.log(e)
        }
    };

    const getAllTokensBalance = () => {
        if (Tokens.find(token => token.value === 'usdt'))
            getBalance({
                tokenAddress: Tokens.find(token => token.value === 'usdt')!.address,
                tokenName: 'usdt'
            })
        if (Tokens.find(token => token.value === 'jpy'))
            getBalance({
                tokenAddress: Tokens.find(token => token.value === 'jpy')!.address,
                tokenName: 'jpy'
            })
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (chainId !== jocConfig.id) {
            toast.error('Please connect to JOC Testnet!')
            return
        }

        const expirationDate = new Date(values.expiration).setHours(parseInt(hour), parseInt(minute))
        const expirationDateUTC = Date.UTC(new Date(expirationDate).getFullYear(), new Date(expirationDate).getMonth(), new Date(expirationDate).getDate(), new Date(expirationDate).getHours(), new Date(expirationDate).getMinutes(), 0)

        try {
            setIsLoadingCreate(true);

            const encryptedCodes = await apiEncrypt({
                codes: values.codes
            })

            let uploadedImg = null
            if (values.image) {
                uploadedImg = await uploadFileToIPFS(values.image)
            }
            const uploadedJson = await uploadJsonToIPFS({
                imgUrl: uploadedImg !== null ? uploadedImg?.pinataURL : '',
                description: values.description
            });

            const {request} = await jocClientRead.simulateContract({
                address: STORE_VOUCHERS,
                abi: STORE_VOUCHERS_ABI,
                functionName: 'createVoucherPack',
                args: [
                    storeId,
                    values.title,
                    parseEther(values.price.toString()),
                    values.token.toUpperCase(),
                    expirationDateUTC,
                    values.codes.length,
                    values.isOtherToken,
                    uploadedJson?.pinataURL,
                    encryptedCodes
                ],
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

    const getStore = async () => {
        try {
            setIsLoadingGetStore(true)
            const eStore: any = await jocClientRead.readContract({
                address: STORE_VOUCHERS,
                abi: STORE_VOUCHERS_ABI,
                functionName: 'stores',
                args: [storeId]
            })
            setIsStoreOwner(eStore[1] === address ? true : false)
            if (eStore[1] !== address) {
                navigate(`/store/${stores[0].id}`)
            }
            setIsLoadingGetStore(false)
        } catch (e) {
            setIsLoadingGetStore(false)
            console.log(e)
        }
    }

    const validateMinute = (value: string) => {
        if (!value) {
            return 'Minute is required.';
        }
        if (!/^\d{1,2}$/.test(value)) {
            return 'Minutes! Please enter a number (0-59).';
        }
        const minuteValue = parseInt(value, 10);
        if (minuteValue < 0 || minuteValue > 59) {
            return 'Minute must be between 0 and 59.';
        }
        return null;
    };

    const handleMinuteChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target;
        const errorMessage = validateMinute(value);
        setMinute(value);
        setMinuteError(errorMessage);
    };

    const handleHourChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target;
        const errorMessage = validateHour(value);
        setHour(value);
        setHourError(errorMessage);
    };

    const validateHour = (value: string) => {
        if (!value) {
            return 'Hour is required.';
        }
        if (!/^\d{1,2}$/.test(value)) {
            return 'Hour! Please enter a number (0-23).';
        }
        const hourValue = parseInt(value, 10);
        if (hourValue < 0 || hourValue > 23) {
            return 'Hour must be between 0 and 23.';
        }
        return null;
    };

    useEffect(() => {
        getStore()
    }, [storeId]);

    useEffect(() => {
        const currentDate = new Date();
        const nextDay = new Date(currentDate);
        nextDay.setDate(currentDate.getDate() + 1);
        form.setValue('expiration', nextDay)

        const handleConvertHourToUTC = () => {
            const date = new Date();
            date.setUTCHours(parseInt(hour, 10));
            const utcHour = date.getUTCHours().toString().padStart(2, '0');
            setHour(utcHour)
        };
        handleConvertHourToUTC()
    }, [])

    if (isLoadingGetStore) {
        return <Loader/>
    }

    return (
        <Card className={"mx-0 bg-gray-100 dark:bg-gray-900"}>
            <CardHeader>
                <CardTitle>Create voucher</CardTitle>
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
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Description" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <div className={"flex flex-col gap-3"}>
                            <div className={"flex w-full items-end gap-1"}>
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({field}) => (
                                        <FormItem className={"w-full"}>
                                            <FormLabel>
                                                <div className={"flex w-full justify-between"}>
                                                    <div>Price</div>
                                                </div>
                                            </FormLabel>
                                            <FormControl>
                                                <div className={"flex items-end gap-2"}>
                                                    <Input
                                                        className={"w-full"}
                                                        placeholder="Price"
                                                        {...field}
                                                        onChange={(e) => {
                                                            if (!isNaN(e.target.value as any)) {
                                                                field.onChange(e.target.value);
                                                            }
                                                        }}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="token"
                                                        render={({field: fieldToken}) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Select
                                                                        value={fieldToken.value}
                                                                        onValueChange={(e) => {
                                                                            field.onChange('0')
                                                                            fieldToken.onChange(e)
                                                                        }}
                                                                    >
                                                                        <SelectTrigger
                                                                            value={fieldToken.value}
                                                                            className="w-[130px]"
                                                                        >
                                                                            <SelectValue placeholder="Select token"/>
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectGroup>
                                                                                {Tokens.map(token =>
                                                                                    <SelectItem key={token.value}
                                                                                                value={token.value}>
                                                                                        <div
                                                                                            className={"flex items-center justify-center gap-3"}>
                                                                                            <img className={"h-5 w-5"}
                                                                                                 src={token.imgSrc}
                                                                                                 alt={""}/>
                                                                                            <div>{token.label}</div>
                                                                                        </div>
                                                                                    </SelectItem>
                                                                                )}
                                                                            </SelectGroup>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormControl>
                                                                <FormMessage/>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="isOtherToken"
                                render={({field}) => (
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            className={"cursor-pointer"}
                                            checked={field.value}
                                            id="terms"
                                            onClick={() => {
                                                field.onChange(!field.value);
                                            }}
                                        />
                                        <label
                                            htmlFor="terms"
                                            className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Accept also payment in{" "}
                                            <span className={'underline'}>
                                            {form.getValues().token === "jpy" ? "USDT" : "JPY"}
                                            </span>
                                        </label>
                                    </div>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="expiration"
                            render={({field}) => (
                                <FormItem className="w-full flex flex-col">
                                    <FormLabel>Expiration</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        <span>{`${format(field.value, "PPP")} | ${hour}:${minute}`}</span>
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className=" p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={(e) => {
                                                    console.log(e)
                                                    field.onChange(e)
                                                }}
                                                disabled={(date) =>
                                                    date < new Date()
                                                }
                                                initialFocus
                                            />

                                            <div className={'grid grid-cols-2 gap-6 p-2 pt-0'}>
                                                <div className={'flex flex-col'}>
                                                    <span className={cn({'text-destructive ': hourError})}>Hour</span>
                                                    <Input
                                                        id="hourInput"
                                                        type="text"
                                                        value={hour}
                                                        onChange={handleHourChange}
                                                        className={cn({'border-destructive': hourError})}
                                                    />
                                                    {hourError && <FormMessage>{hourError}</FormMessage>}

                                                </div>
                                                <div className={'flex flex-col'}>
                                                    <span className={cn({'text-destructive ': minuteError})}>Min</span>
                                                    <Input
                                                        id="minuteInput"
                                                        type="text"
                                                        value={minute}
                                                        onChange={handleMinuteChange}
                                                        className={cn({'border-destructive': minuteError})}
                                                    />
                                                    {minuteError && <FormMessage>{minuteError}</FormMessage>}

                                                </div>
                                            </div>
                                            {minTimeError && <FormMessage>{minTimeError}</FormMessage>}
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="codes"
                            render={({field}) => (
                                <FormItem className={"w-full"}>
                                    <FormLabel>
                                        <div className={"flex w-full justify-between"}>
                                            <div>Codes</div>
                                        </div>
                                    </FormLabel>
                                    <FormControl className={'flex w-full'}>
                                        <div className={'flex flex-col items-center gap-4'}>
                                            <div className={"flex items-end gap-2 w-full"}>
                                                <Input
                                                    className={"w-full"}
                                                    placeholder="Code"
                                                    value={codeValue}
                                                    onChange={(e) => setCodeValue(e.target.value)}
                                                />
                                                <Button onClick={(e) => {
                                                    e.stopPropagation()
                                                    e.preventDefault()

                                                    if (field.value.includes(codeValue)) {
                                                        toast.error('Each code must be unique!')
                                                        return
                                                    }

                                                    if (codeValue !== "") {
                                                        field.onChange([...field.value, codeValue])
                                                        setCodeValue("")
                                                    } else {
                                                        toast.error('Code is empty!')
                                                    }
                                                }}>
                                                    Add
                                                </Button>
                                            </div>
                                            <div className={'flex items-center gap-2 flex-wrap w-full'}>
                                                {field.value.map((code) => (
                                                    <Badge className={"h-min text-[16px] flex items-center gap-2"}>
                                                        <div>{code}</div>
                                                        <XIcon
                                                            className={"cursor-pointer"}
                                                            size={15}
                                                            onClick={() => {
                                                                field.onChange(
                                                                    field.value?.filter((item) => item !== code),
                                                                );
                                                            }}
                                                        />
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
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
                                    Create voucher
                                </Button>
                            </div>
                        }
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default CreateMarketItem;