const productService = require('../service/productService')
const resStatus = require('../config/response')

exports.getProducts = async(req,res)=>{
    try{
        const clipLink = req.query.clipLink;
        console.log(clipLink)
        if(!clipLink)
            return res.status(400).send(resStatus.CLIPLINK_EMPTY);

        const clipList = await productService.getProductInfo(clipLink)
        return res.send(clipList)
    }catch (err) {
        console.log(err);
        return res.status(404).send(resStatus.PRODUCT_DB_ERR);
    }
}