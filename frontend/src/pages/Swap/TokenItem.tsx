import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

import {jocConfig} from "@/lib/wagmi.ts";
import {useAccount} from "wagmi";
import {Button} from "@/components/ui/button.tsx";
import {Tokens} from "@/lib/constants.ts";

type TokenItemProps = {
    token: "usdt" | 'jpy';
    amountToken: any;
    readOnly: boolean;
    tokensBalance: {
        'usdt': number,
        "jpy": number
    };
    onChangeAmount: (x?: any) => void;
    onChangeToken: (x?: any) => void;
}

export const TokenItem = ({
                              token,
                              amountToken,
                              onChangeAmount,
                              onChangeToken,
                              readOnly,
                              tokensBalance
                          }: TokenItemProps) => {
    const {chainId, address} = useAccount()

    return (
        <div className={"flex flex-col  justify-between gap-1"}>
            <div className={"flex w-full justify-between"}>
                <div></div>
                <div className={"flex gap-2"}>
                    <div className={"text-sm text-muted-foreground"}>{tokensBalance[token]} {token.toUpperCase()}</div>
                    {!readOnly &&
                        <Button onClick={() => {
                            onChangeAmount(tokensBalance[token])
                        }} variant={"secondary"} className={"h-min p-0 px-1 pb-px"}>
                            max
                        </Button>
                    }
                </div>
            </div>
            <div className={'flex items-center justify-between gap-1'}>
                <Input
                    disabled={(address === undefined) || (chainId !== jocConfig.id)}
                    placeholder={"Amount"}
                    value={amountToken}
                    readOnly={readOnly}
                    onChange={(e) => onChangeAmount(e.target.value)}
                />
                <Select value={token} onValueChange={onChangeToken}>
                    <SelectTrigger
                        className="w-[150px]"
                        disabled={(address === undefined) || (chainId !== jocConfig.id)}
                    >
                        <SelectValue placeholder="Select token"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {Tokens.map((token) => (
                                <SelectItem key={token.value} value={token.value}>
                                    <div className={"flex items-center justify-center gap-3"}>
                                        <img className={"h-5 w-5"} src={token.imgSrc} alt={""}/>
                                        <div>{token.label}</div>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};