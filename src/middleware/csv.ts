import parse from 'csv-parse';
import fs from 'fs';
import { ExportToCsv } from 'export-to-csv';

export default class Csv {
    getCsvRecords = async <T>(fileName: string, delimiter = '\t'): Promise<T[]> => {
        return new Promise<T[]>((resolve, reject) => {
            const readStream = fs.createReadStream(fileName);
            readStream.pipe(
                parse(
                    {
                        delimiter: delimiter,
                        columns: (header) =>
                            header.map((column: string) =>
                                column
                                    .replace('-', '_')
                                    .replace('-', '_')
                                    .replace(' ', '_')
                                    .replace(' ', '_')
                                    .replace(' ', '_')
                                    .toLowerCase(),
                            ),
                    },
                    (err, records: T[]) => {
                        if (!err) {
                            resolve(records);
                        } else {
                            reject(err);
                        }
                    },
                ),
            );
        });
    };

    createCSVFile<T>(fileName: string, data: T[]) {
        const headers = Object.keys(data[0]).map((v) =>
            v
                .replace('_', ' ')
                .replace('_', ' ')
                .replace('_', ' ')
                .replace('_', ' ')
                .replace('_', ' ')
                .replace('_', ' '),
        );
        const options = {
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalSeparator: '.',
            showLabels: true,
            // showTitle: true,
            // title: fileName,
            // useTextFile: false,
            // useBom: true,
            useKeysAsHeaders: false,
            headers: headers,
        };
        const csvExporter = new ExportToCsv(options);
        const csvData = csvExporter.generateCsv(data, true);
        fs.writeFileSync(__dirname + '/../' + fileName + '.csv', csvData);
    }
}
