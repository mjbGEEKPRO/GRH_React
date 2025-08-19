import axios from "axios";

import { useState, useEffect } from "react";


type Options={
    value: string;
    label: string
};


type  Props={
    url: string;
    onChange:(value : string)=> void;
}

const Select : React.FC<Props> = ({url,onChange})=> {
    const [options,setOptions]=
}