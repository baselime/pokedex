/**
 * 
 * @param {import("aws-lambda").KinesisStreamEvent} e 
 */
module.exports.handler  = async (e) => {
    const requests = e.Records.map(el => JSON.parse(Buffer.from(el.kinesis.data, 'base64').toString('utf-8')))
    console.log(requests)
}