import {Button} from "@/components/ui/button.tsx";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Chains} from "@/lib/constants.ts";
import {Input} from "@/components/ui/input.tsx";

type ChainItemProps = {
    chain: "arbitrum" | "joc";
    amountToken: string;
    onChangeToken: (token: any) => void;
    onChangeTokenAmount: (amount: any) => void;
    type: "From" | "To";
    tokenBalance: {
        'arbitrum': number,
        'joc': number
    }
}

export const ChainItem = ({
                              chain,
                              amountToken,
                              onChangeToken,
                              onChangeTokenAmount,
                              type,
                              tokenBalance
                          }: ChainItemProps) => {
    return (
        <div className={"flex flex-col gap-2"}>
            <div className={"flex w-full justify-between"}>
                <div>{type}:</div>
                <div className={"flex gap-2"}>
                    <div className={"text-sm text-muted-foreground"}>{tokenBalance[chain]} JPY</div>
                    {type !== "To" && (
                        <Button onClick={() => onChangeTokenAmount(tokenBalance[chain])} variant={"secondary"}
                                className={"h-min p-0 px-1 pb-px"}>
                            max
                        </Button>
                    )}
                </div>
            </div>
            <div className={"flex items-center justify-between gap-1"}>
                <Select value={chain} onValueChange={onChangeToken}>
                    <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="Select a fruit"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {Chains.map((chain) => (
                                <SelectItem key={chain.value} value={chain.value}>
                                    <div className={"flex items-center justify-center gap-3"}>
                                        <img className={"h-5 w-5"} src={chain.imgSrc} alt={""}/>
                                        <div>{chain.label}</div>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Input
                    placeholder={`Amount JPY`}
                    value={amountToken}
                    readOnly={type === "To"}
                    onChange={(e) => onChangeTokenAmount(e.target.value)}
                />
            </div>
        </div>
    );
};