import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Radio, Select, Table, Slider, InputNumber, TimePicker, Input, Switch } from 'antd'
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Line } from 'react-chartjs-2';
import dayjs from 'dayjs'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';

import query from "../../utils/query";
import TitleCard from "../../components/Cards/TitleCard"
import OperationPane from "./OperationPane"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/16/solid";
import { useSelector } from "react-redux";

const { Column, ColumnGroup } = Table;

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);


const format = 'HH:mm'

// Constants
const medicine = [['Remimazolam', 'Dexmedetomidine'], ['Remifentanil', 'Fentanyl']]
const unit = [['mg/kg/h', 'μg/kg/h'], ['μg/mL', 'ng/mL'], ['μg/kg/min', 'μg/min'], ['ng/mL', 'ng/mL']]
const unit1 = [['mg/kg/h', 'mg/kg'], ['μg/kg/h', 'μg/kg']]
const unit2 = [['μg/kg/min', 'μg/kg'], ['μg/min', 'μg']]

const ASA_PS_Options = [
    { value: 1, label: 'I' },
    { value: 2, label: 'II' },
    { value: 3, label: 'III' },
    { value: 4, label: 'IV' },
]

const Pharmacokinetic = () => {
    const { user } = useSelector(state => state.user);
    const { t } = useTranslation();
    //
    const [isShowTable, setShowTable] = useState(true);
    // Main params
    const [HT, setHT] = useState(170)
    const [BW, setBW] = useState(70)
    const [age, setAge] = useState(40)
    const [gendor, setGendor] = useState(0)
    const [ASA_PS, set_ASA_PS] = useState(1)

    const [hypnotics, setHypnotics] = useState(0)
    const [opioid, setOpioid] = useState(0)
    const [time, setTime] = useState(2)
    const [startTime, setStartTime] = useState(dayjs('9.00', format))
    // Operations
    const [operations1, setOperations1] = useState([{ mode: 0, time: 0, value: 1 }]);
    const [operations2, setOperations2] = useState([{ mode: 0, time: 0, value: 1 }]);
    const [operations3, setOperations3] = useState([{ mode: 0, time: 0, value: 0.2 }]);
    const [operations4, setOperations4] = useState([{ mode: 0, time: 0, value: 0.2 }]);
    // Cha Page
    const [LBM, setLBM] = useState(0) //C7
    const [ABW, setABW] = useState(0) //C9
    const [IBW, setIBW] = useState(0) //C10
    useEffect(() => {
        if (gendor == 0)
            setLBM(1.1 * BW - 128 * Math.pow(BW / HT, 2))
        else
            setLBM(1.07 * BW - 148 * Math.pow(BW / HT, 2))
    }, [HT, BW, gendor])
    useEffect(() => {
        setABW(IBW + 0.4 * (BW - IBW))
    }, [IBW, BW])
    useEffect(() => {
        setIBW(45.4 + 0.89 * (HT - 152.4) + 4.5 * (1 - gendor))
    }, [HT, gendor])
    // PKP Page
    const keo = 0.12 //B3
    const Thalfkeo = 5.8 //B4
    const Peakeffect = 3.559 //B5
    const V1 = 6.09 //B6
    const V2 = 28.121 //B12
    const V3 = 228.275 //B13
    const k21 = 0.102 //B7
    const k31 = 0.006 //B8
    const k10 = 0.0827 //B9
    const k12 = 0.471 //B10
    const k13 = 0.225 //B11
    const C1 = 30.219 //B14
    const C2 = 172.103 //B15
    const C3 = 82.215 //B16
    const CL1 = C1 / 60 //B17
    const CL2 = C2 / 60 //B18
    const CL3 = C3 / 60 //B19
    const Q = [0, 3.57, 11.3, 27.2, 1.03, 1.1, 0.401, 1.19, 0.308, 0.146, -0.184, 0.0205] // F 30-40
    const [R0, setR0] = useState(0) //E3
    const [RM0, setRM0] = useState(0) //F3
    const [D0, setD0] = useState(0) //G3
    const [D_Dyck0, setD_Dyck0] = useState(0) //H3
    const [R1, setR1] = useState(0) //E4
    const [RM1, setRM1] = useState(0) //F4
    const [D1, setD1] = useState(16.19158879) //G4
    const [D_Dyck1, setD_Dyck1] = useState(16.19158879) //H4
    const [V0, setV0] = useState([0, 0, 0, 0]) // EFGH 6
    const [V1_K12_K21, set_V1_K12_K21] = useState([0, 0, 0, 0]) // EFGH 19
    const [V1_K13_K31, set_V1_K13_K31] = useState([0, 0, 0, 0]) // EFGH 13
    const [CL2_V2, set_CL2_V2] = useState([0, 0, 0, 0]) // EFGH 7
    const [CL3_V3, set_CL3_V3] = useState([0, 0, 0, 0]) // EFGH 8
    const [CL1_V1, set_CL1_V1] = useState([0, 0, 0, 0]) // EFGH 9
    const [CL2_V1, set_CL2_V1] = useState([0, 0, 0, 0]) // EFGH 10
    const [CL3_V1, set_CL3_V1] = useState([0, 0, 0, 0]) // EFGH 11
    const [V1_K10, set_V1_K10] = useState([0, 0, 0, 0]) // EFGH 17
    const [V1_K12, set_V1_K12] = useState([0, 0, 0, 0]) // EFGH 18
    const [V1_K13, set_V1_K13] = useState([0, 0, 0, 0]) // EFGH 19
    useEffect(() => {
        setR0(0.693 / R1)
    }, [R1])
    useEffect(() => {
        setRM0((Q[7] + Q[11] * (age - 54)) * Math.pow(ABW / 67.3, -0.25))
    }, [age, ABW])
    useEffect(() => {
        setD0(0.693 / D1)
    }, [D1])
    useEffect(() => {
        setD_Dyck0(0.693 / D_Dyck1)
    }, [D_Dyck1])
    useEffect(() => {
        setR1(0.69314718 / (0.595 - 0.007 * (age - 40)))
    }, [age])
    useEffect(() => {
        setRM1(0.693 / RM0)
    }, [RM0])
    useEffect(() => {
        setV0([
            5.1 - 0.0201 * (age - 40) + 0.072 * (LBM - 55),
            Q[1] * ABW / 67.3,
            1.78 * BW / 70,
            7.9,
        ])
    }, [age, LBM, ABW, BW])
    useEffect(() => {
        set_V1_K12_K21([
            9.82 - 0.0811 * (age - 40) + 0.108 * (LBM - 55),
            Q[2] * (ABW / 67.3),
            (30.3 * BW / 70),
            13.8,
        ])
    }, [age, LBM, ABW, BW])
    useEffect(() => {
        set_V1_K13_K31([
            5.42,
            (Q[3] + Q[8] * (age - 54)) * (ABW / 67.3),
            52 * BW / 70,
            187,
        ])
    }, [age, ABW, BW])
    useEffect(() => {
        set_CL2_V2([
            V1_K12[0] / V1_K12_K21[0],
            V1_K12[1] / V1_K12_K21[1],
            V1_K12[2] / V1_K12_K21[2],
            V1_K12[3] / V1_K12_K21[3],
        ])
    }, [V1_K12, V1_K12_K21])
    useEffect(() => {
        set_CL3_V3([
            V1_K13[0] / V1_K13_K31[0],
            V1_K13[1] / V1_K13_K31[1],
            V1_K13[2] / V1_K13_K31[2],
            V1_K13[3] / V1_K13_K31[3],
        ])
    }, [V1_K13, V1_K13_K31])
    useEffect(() => {
        set_CL1_V1([
            V1_K10[0] / V0[0],
            V1_K10[1] / V0[1],
            V1_K10[2] / V0[2],
            V1_K10[3] / V0[3],
        ])
    }, [V1_K10, V0])
    useEffect(() => {
        set_CL2_V1([
            V1_K12[0] / V0[0],
            V1_K12[1] / V0[1],
            V1_K12[2] / V0[2],
            V1_K12[3] / V0[3],
        ])
    }, [V1_K12, V0])
    useEffect(() => {
        set_CL3_V1([
            V1_K13[0] / V0[0],
            V1_K13[1] / V0[1],
            V1_K13[2] / V0[2],
            V1_K13[3] / V0[3],
        ])
    }, [V1_K13, V0])
    useEffect(() => {
        set_V1_K10([
            2.6 - 0.0162 * (age - 40) + 0.0191 * (LBM - 55),
            Q[4] + Q[9] * gendor + Q[10] * (ASA_PS == 1 || ASA_PS == 2 ? 0 : 1) * Math.pow(ABW / 67.3, 0.75),
            0.686 * Math.pow(BW / 70, 0.75),
            -0.927 + 0.00791 * HT,
        ])
    }, [age, LBM, gendor, ASA_PS, ABW, BW, HT])
    useEffect(() => {
        set_V1_K12([
            2.05 - 0.0301 * (age - 40),
            Q[5] * Math.pow(ABW / 67.3, 0.75),
            2.98 * Math.pow((30.3 * BW / 70) / 30.3, 0.75),
            2.26,
        ])
    }, [age, ABW, BW])
    useEffect(() => {
        set_V1_K13([
            0.076 - 0.00113 * (age - 40),
            Q[6] * Math.pow(ABW / 67.3, 0.75),
            0.602 * Math.pow((52 * BW / 70) / 70, 0.75),
            1.99
        ])
    }, [age, ABW, BW])

    // T Page
    const [K1, setK1] = useState({ k10: 0, k12: 0, k21: 0, k13: 0, k31: 0, k14: 0, k41: 0, V: 0 })
    const [K2, setK2] = useState({ k10: 0, k12: 0, k21: 0, k13: 0, k31: 0, k14: 0, k41: 0, V: 0 })

    useEffect(() => {
        const k41 = hypnotics == 0 ? RM0 : D_Dyck0
        setK1({
            k10: hypnotics == 0 ? CL1_V1[1] : CL1_V1[3],
            k12: hypnotics == 0 ? CL2_V1[1] : CL2_V1[3],
            k21: hypnotics == 0 ? CL2_V2[1] : CL2_V2[3],
            k13: hypnotics == 0 ? CL3_V1[1] : CL3_V1[3],
            k31: hypnotics == 0 ? CL3_V3[1] : CL3_V3[3],
            k14: k41 / 10000,
            k41: k41,
            V: hypnotics == 0 ? V0[1] : V0[3]
        })
    }, [hypnotics, CL1_V1, CL2_V1, CL2_V2, CL3_V1, CL3_V3, RM0, D_Dyck0, V0])
    useEffect(() => {
        const k41 = opioid == 0 ? R0 : keo
        setK2({
            k10: opioid == 0 ? CL1_V1[0] : k10,
            k12: opioid == 0 ? CL2_V1[0] : k12,
            k21: opioid == 0 ? CL2_V2[0] : k21,
            k13: opioid == 0 ? CL3_V1[0] : k13,
            k31: opioid == 0 ? CL3_V3[0] : k31,
            k14: k41 / 10000,
            k41: k41,
            V: opioid == 0 ? V0[0] : V1
        })
    }, [opioid, CL1_V1, CL2_V1, CL2_V2, CL3_V1, CL3_V3, R0, V0])

    const [TData1, setTData1] = useState([])
    const [TData2, setTData2] = useState([])

    useEffect(() => {
        let $H = startTime.$H
        let $m = startTime.$m

        const newTData = []

        let X1 = 0
        let X2 = 0
        let X3 = 0
        let X4 = 0
        let Dose = 0

        for (let i = 0; i < time * 60; i++) {
            let bolus = 0;
            if (hypnotics == 0) {
                operations1.map(operation => {
                    if (operation.mode == 0 && operation.time == i)
                        Dose = operation.value
                    if (operation.mode == 1 && operation.time == i)
                        bolus += operation.value
                })
            } else {
                operations2.map(operation => {
                    if (operation.mode == 0 && operation.time == i)
                        Dose = operation.value
                    if (operation.mode == 1 && operation.time == i)
                        bolus += operation.value
                })
            }
            let Dose2 = Dose + bolus;
            let X0 = BW * Dose2 / 60
            let dx1_dt = -(K1.k10 + K1.k12 + K1.k13 + K1.k14) * X1 + K1.k21 * X2 + K1.k31 * X3 + K1.k41 * X4 + X0
            let dx2_dt = K1.k12 * X1 - K1.k21 * X2
            let dx3_dt = K1.k13 * X1 - K1.k31 * X3
            let dx4_dt = K1.k14 * X1 - K1.k41 * X4

            newTData.push({
                time: `${$H.toString().padStart(2, '0')}:${$m.toString().padStart(2, '0')}`,
                minutes: i,
                X1,
                X2,
                X3,
                X4,
                dx1_dt,
                dx2_dt,
                dx3_dt,
                dx4_dt,
                Dose: Dose2,
                ESC: X4 * 10000 / K1.V
            })

            X1 += dx1_dt
            X2 += dx2_dt
            X3 += dx3_dt
            X4 += dx4_dt

            $m++
            if ($m == 60) {
                $H++
                $m = 0
                if ($H == 24)
                    $H = 0
            }
        }

        setTData1(newTData)
    }, [time, startTime, K1, operations1, operations2])

    useEffect(() => {
        let $H = startTime.$H
        let $m = startTime.$m

        const newTData = []

        let X1 = 0
        let X2 = 0
        let X3 = 0
        let X4 = 0
        let Dose = 0

        for (let i = 0; i < time * 60; i++) {
            let bolus = 0;
            if (opioid == 0) {
                operations3.map(operation => {
                    if (operation.mode == 0 && operation.time == i)
                        Dose = operation.value
                    if (operation.mode == 1 && operation.time == i)
                        bolus += operation.value
                })
            } else {
                operations4.map(operation => {
                    if (operation.mode == 0 && operation.time == i)
                        Dose = operation.value
                    if (operation.mode == 1 && operation.time == i)
                        bolus += operation.value
                })
            }
            let Dose2 = Dose + bolus;
            let X0 = opioid == 0 ? BW * Dose2 : Dose2
            let dx1_dt = -(K2.k10 + K2.k12 + K2.k13 + K2.k14) * X1 + K2.k21 * X2 + K2.k31 * X3 + K2.k41 * X4 + X0
            let dx2_dt = K2.k12 * X1 - K2.k21 * X2
            let dx3_dt = K2.k13 * X1 - K2.k31 * X3
            let dx4_dt = K2.k14 * X1 - K2.k41 * X4

            newTData.push({
                time: `${$H.toString().padStart(2, '0')}:${$m.toString().padStart(2, '0')}`,
                minutes: i,
                X1,
                X2,
                X3,
                X4,
                dx1_dt,
                dx2_dt,
                dx3_dt,
                dx4_dt,
                Dose: Dose2,
                ESC: X4 * 10000 / K2.V
            })

            X1 += dx1_dt
            X2 += dx2_dt
            X3 += dx3_dt
            X4 += dx4_dt

            $m++
            if ($m == 60) {
                $H++
                $m = 0
                if ($H == 24)
                    $H = 0
            }
        }
        setTData2(newTData)
    }, [time, startTime, K2, operations3, operations4])

    // PKS page

    const [tableData, setTableData] = useState([])
    const [chartData, setChartData] = useState({ labels: [], datasets: [] })

    useEffect(() => {
        setChartData({
            labels: TData1.map(v => v.minutes),
            datasets: [
                {
                    label: `${medicine[0][hypnotics]} [${unit[1][hypnotics]}]`,
                    data: TData1.map(v => v.ESC),
                    yAxisID: 'y1',
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    pointBackgroundColor: 'transparent',
                    pointBorderColor: 'transparent'
                },
                {
                    label: `${medicine[1][opioid]} [${unit[3][opioid]}]`,
                    data: TData2.map(v => v.ESC),
                    yAxisID: 'y2',
                    borderColor: 'rgb(53, 162, 235)',
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    pointBackgroundColor: 'transparent',
                    pointBorderColor: 'transparent'
                },
            ],
        })
    }, [TData1, TData2])

    useEffect(() => {
        if (TData1.length == TData2.length) {
            const newTableData = []
            for (let i = 0; i < TData1.length; i++) {
                newTableData.push({
                    key: i,
                    A: TData1[i].time,
                    B: TData1[i].minutes,
                    C: TData1[i].Dose,
                    D: TData1[i].ESC.toFixed(2),
                    E: TData2[i].Dose,
                    F: TData2[i].ESC.toFixed(2),
                })
            }
            setTableData(newTableData)
        }
    }, [TData1, TData2])

    const [name, setName] = useState('');

    const onSave = () => {
        query.post('/PKS', {
            name,
            height: HT,
            weight: BW,
            age,
            gendor,
            ASA_PS,
            remimazolam: operations1,
            dexmedetomidine: operations2,
            remifentanil: operations3,
            fentanyl: operations4,
        })
    }

    const [queryParameters] = useSearchParams()

    useEffect(() => {
        const _id = queryParameters.get('_id');
        if (_id) {
            query.get('/PKS/' + _id, ({ result }) => {
                setName(result.name);
                setHT(result.height);
                setBW(result.weight);
                setAge(result.age);
                setGendor(result.gendor);
                set_ASA_PS(result.ASA_PS);
                setOperations1(result.remimazolam);
                setOperations2(result.dexmedetomidine);
                setOperations3(result.remifentanil);
                setOperations4(result.fentanyl);
            })
        }
    }, [])

    const chartRef = useRef();

    const onDownload = () => {
        const canvas = chartRef.current.canvas;

        // Set the desired background color
        const backgroundColor = 'white';

        // Create a new canvas element with the desired background color
        const newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height;
        const context = newCanvas.getContext('2d');
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, newCanvas.width, newCanvas.height);
        context.drawImage(canvas, 0, 0);

        // Convert the new canvas to a base64 image with the white background
        const base64Image = newCanvas.toDataURL('image/png');

        // Save the image with the white background
        saveAs(base64Image, `${name}.png`);

        const data = [];

        data[1] = [];
        data[2] = [];
        data[3] = [];
        data[4] = [];
        data[5] = [];
        data[6] = [];

        data[1][1] = 'Patient';
        data[1][4] = 'Agents';

        data[2][1] = 'HT';
        data[3][1] = 'BW';
        data[4][1] = 'Age';
        data[5][1] = 'Gendor';
        data[6][1] = 'ASA-PS';

        data[2][2] = HT;
        data[3][2] = BW;
        data[4][2] = age;
        data[5][2] = gendor == 0 ? 'Male' : 'Female';
        data[6][2] = ASA_PS == 1 ? 'I' : ASA_PS == 2 ? 'II' : ASA_PS == 3 ? 'III' : 'IV';

        data[2][3] = 'cm';
        data[3][3] = 'kg';

        data[2][4] = 'Hypnotics';
        data[3][4] = 'Opioid';
        data[4][4] = 'Simulation duration [h]';
        data[6][4] = 'Start'

        data[2][5] = hypnotics == 0 ? 'Remimazolam' : 'Dexmedetomidine';
        data[3][5] = opioid == 0 ? 'Remifentanil' : 'Fentanyl';
        data[4][5] = time;
        data[6][5] = startTime.format('HH:mm');

        data[8] = [];
        data[8][1] = 'Time';
        data[8][3] = data[2][5];
        data[8][5] = data[3][5];

        data[9] = []
        data[9][1] = '[h:m]';
        data[9][2] = 'min';
        data[9][3] = `Dose(${unit[0][hypnotics]})`;
        data[9][4] = `ESC(${unit[1][hypnotics]})`;
        data[9][5] = `Dose(${unit[2][opioid]})`;
        data[9][6] = `ESC(${unit[3][opioid]})`;

        for (let i = 0, j = 10; i < tableData.length; i++, j++) {
            data[j] = [];
            data[j][1] = tableData[i].A;
            data[j][2] = tableData[i].B;
            data[j][3] = tableData[i].C;
            data[j][4] = tableData[i].D;
            data[j][5] = tableData[i].E;
            data[j][6] = tableData[i].F;
        }

        const worksheet = XLSX.utils.aoa_to_sheet(data);
        const workbook = XLSX.utils.book_new();

        // Merge cells
        worksheet['!merges'] = [
            { s: { r: 1, c: 1 }, e: { r: 1, c: 3 } },
            { s: { r: 1, c: 4 }, e: { r: 1, c: 5 } },
            { s: { r: 4, c: 4 }, e: { r: 5, c: 4 } },
            { s: { r: 4, c: 5 }, e: { r: 5, c: 5 } },
            { s: { r: 8, c: 1 }, e: { r: 8, c: 2 } },
            { s: { r: 8, c: 3 }, e: { r: 8, c: 4 } },
            { s: { r: 8, c: 5 }, e: { r: 8, c: 6 } },
        ];

        worksheet['!cols'] = [];

        for (let i = 0; i <= 6; i++) {
            worksheet['!cols'][i] = { wch: i == 0 ? 2 : 12 };
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, 'PKS');
        const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });

        saveAs(new Blob([excelBuffer]), `${name}.xlsx`);
    };

    return (
        <>
            <div className="flex flex-wrap">
                <div className="w-full xl:w-1/3 pr-0 xl:pr-2">
                    <TitleCard title={"Patient"}>
                        <div className="flex w-full mt-4 items-center">
                            <p className="w-1/6 text-[12px]">{t('name')}:</p>
                            <div className="w-5/6 flex gap-2">
                                <Input className="flex-grow" onChange={(e) => setName(e.target.value)} value={name} />
                                {user.current_pricing_plan == 2 && (
                                    <>
                                        <button className={`btn btn-primary btn-sm flex-none ${name.length == 0 && 'btn-disabled'}`} onClick={onSave}>{t('save')}</button>
                                        <button className={`btn btn-primary btn-sm flex-none ${name.length == 0 && 'btn-disabled'}`} onClick={onDownload}>{t('download')}</button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex w-full mt-4 items-center">
                            <p className="w-1/6 text-[12px]">HT:</p>
                            <InputNumber
                                className="w-5/6"
                                suffix={`cm`}
                                value={HT}
                                onChange={setHT}
                            />
                        </div>
                        <div className="flex w-full mt-4 items-center">
                            <p className="w-1/6 text-[12px]">BW:</p>
                            <InputNumber
                                className="w-5/6"
                                suffix={`kg`}
                                value={BW}
                                onChange={setBW}
                            />
                        </div>
                        <div className="flex w-full mt-4 items-center">
                            <p className="w-1/6 text-[12px]">Age:</p>
                            <InputNumber
                                className="w-5/6"
                                value={age}
                                onChange={setAge}
                            />
                        </div>
                        <div className="flex w-full mt-4 items-center">
                            <p className="w-1/6 text-[12px]">Gendor:</p>
                            <Radio.Group
                                className="w-5/6"
                                value={gendor}
                                onChange={(e) => setGendor(e.target.value)}
                            >
                                <Radio value={0}>Male</Radio>
                                <Radio value={1}>Female</Radio>
                            </Radio.Group>
                        </div>
                        <div className="flex w-full mt-4 items-center">
                            <p className="w-1/6 text-[12px]">ASA-PS:</p>
                            <Select
                                className="w-5/6"
                                options={ASA_PS_Options}
                                value={ASA_PS}
                                onChange={set_ASA_PS}
                            />
                        </div>
                    </TitleCard>
                </div>

                <div className="w-full xl:w-2/3 pl-0 xl:pl-2">
                    <TitleCard title={"Agent"}>
                        <div className="w-full flex-wrap flex items-start">
                            <div className="w-full xl:w-1/2 mt-4 xl:pr-2">
                                <div className="w-full flex items-center">
                                    <p className="w-1/4 text-[12px]">Hypnotics:</p>
                                    <Select
                                        className="w-3/4"
                                        value={hypnotics}
                                        options={[
                                            { value: 0, label: 'Remimazolam' },
                                            { value: 1, label: 'Dexmedetomidine' },
                                        ]}
                                        onChange={setHypnotics}
                                    />
                                </div>
                                <OperationPane operations={hypnotics == 0 ? operations1 : operations2} setOperations={hypnotics == 0 ? setOperations1 : setOperations2} startTime={startTime} unit={unit1[hypnotics]} />
                            </div>
                            <div className="w-full xl:w-1/2 mt-4 xl:pl-2">
                                <div className="w-full flex items-center">
                                    <p className="w-1/4 text-[12px]">Opioid:</p>
                                    <Select
                                        className="w-3/4"
                                        value={opioid}
                                        options={[
                                            { value: 0, label: 'Remifentanil' },
                                            { value: 1, label: 'Fentanyl' },
                                        ]}
                                        onChange={setOpioid}
                                    />
                                </div>
                                <OperationPane operations={opioid == 0 ? operations3 : operations4} setOperations={opioid == 0 ? setOperations3 : setOperations4} startTime={startTime} unit={unit2[opioid]} />
                            </div>
                        </div>
                        <div className="flex w-full mt-4 items-center">
                            <p className="w-1/3 text-[12px]">Simulation duration:</p>
                            <div className="w-2/3 flex gap-4">
                                <InputNumber
                                    className="w-1/2"
                                    min={2}
                                    max={12}
                                    value={time}
                                    onChange={setTime}
                                    suffix={'h'}
                                />
                                <Slider
                                    className="w-1/2"
                                    min={2}
                                    max={12}
                                    onChange={setTime}
                                    value={time}
                                />
                            </div>
                        </div>
                        <div className="flex w-full mt-4 items-center">
                            <p className="w-1/6 text-[12px]">Start time:</p>
                            <TimePicker
                                className="w-5/6"
                                defaultValue={dayjs('9:00', format)}
                                format={format}
                                onChange={setStartTime}
                                allowClear={false}
                            />
                        </div>
                    </TitleCard>
                </div>
            </div>
            <div className="flex flex-wrap items-start">
                <TitleCard className="w-full" title={"Dose and Effect site concentration (Chart)"}>
                    <Line className="h-80 md:h-96" data={chartData} options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            tooltip: {
                                intersect: false,
                                callbacks: {
                                    title: context => `${context[0].label} min`
                                }
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Simulation duration (min)',
                                    font: {
                                        weight: 'bold',
                                    }
                                },
                            },
                            y1: {
                                type: 'linear',
                                display: true,
                                position: 'left',
                                min: 0,
                                title: {
                                    display: true,
                                    text: `${medicine[0][hypnotics]} [${unit[1][hypnotics]}]`,
                                },
                            },
                            y2: {
                                type: 'linear',
                                display: true,
                                position: 'right',
                                min: 0,
                                title: {
                                    display: true,
                                    text: `${medicine[1][opioid]} [${unit[3][opioid]}]`,
                                }
                            },
                        },
                    }} ref={chartRef} />
                </TitleCard>
                {/* <TitleCard className="w-full" title="Dose and Effect site concentration (Table)">
                    {
                        <Table dataSource={tableData} bordered scroll={{ x: 'auto' }}>
                            <ColumnGroup title="Time">
                                <Column title="[h:m]" dataIndex="A" key="A" />
                                <Column title="[min]" dataIndex="B" key="B" />
                            </ColumnGroup>
                            <Column title={`Dose(${unit[0][hypnotics]})`} dataIndex="C" key="C" />
                            <Column title={`ESC(${unit[1][hypnotics]})`} dataIndex="D" key="D" />
                            <Column title={`Dose(${unit[2][opioid]})`} dataIndex="E" key="E" />
                            <Column title={`ESC(${unit[3][opioid]})`} dataIndex="F" key="F" />
                        </Table>
                    }
                </TitleCard> */}
            </div>
        </>
    )
}

export default Pharmacokinetic