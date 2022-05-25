import { useState, useEffect } from 'react'
import { useParams } from "react-router-dom";
import '../../css/Table.css'
import axios from 'axios'

export const PostgresTable = () => {
    const { table_name } = useParams();
    const [data, setData] = useState(null)

    useEffect(() => {
        axios.get('http://localhost:3001/postgres/table/' + table_name).then((response) => {
            console.log(response)
            setData(response.data.result)
        })
        return () => {
        }
    }, [table_name])

    return (
        <div>
            {
                data === null ?
                    <svg className="loader progress" width="80" height="80" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="40" cy="40" r="30"></circle>
                    </svg>
                    : <table className='postgres'>
                        <thead>
                            <tr>
                                {data.fields.map((field, index) => <th key={index}>{field.name}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {data.rows.map((row, indexRow) =>
                                <tr key={indexRow}>
                                    {data.fields.map((field, indexField) => <td key={indexField}>{row[field.name]}</td>)}
                                </tr>
                            )}
                        </tbody>
                    </table>
            }
        </div>
    )
}