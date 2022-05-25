import {
    useParams
} from "react-router-dom";

export const MongoDBTable = () => {
    const { table_name } = useParams();

    return (
        <div>
            table for: {table_name}
        </div>
    )
}