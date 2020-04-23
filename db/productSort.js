var productState = require('../db/productState.js');
var getDateCunstom=require('../db/getPresentTime.js');
module.exports={
  getProductAmount : function(product, productList){
    var result=[];
    for(var i=0; i<productList.length;i++)
    {
      result[i]={reciveAmount:0,allAmount:0}//수령상태의 제품별 총갯수*가격,전체 상태의 제품별 총갯수*가격
      for(var j=0; j<product.length;j++)
      {
        if(product[j].productCode==productList[i].productCode){
          if(product[j].State==productState.DONE){
            result[i].reciveAmount= parseInt(result[i].reciveAmount)+parseInt(product[j].productAmount);
          }
          result[i].allAmount=parseInt(result[i].allAmount)+parseInt(product[j].productAmount);
        }
      }
    }

    return result;
  },
  getProductPrice: ( result,productList)=>{
    var total={all:0,recive:0};
    for(var i=0; i<productList.length;i++)
    {
      total.all=parseInt(total.all)+(parseInt(result[i].allAmount)*parseInt(productList[i].costPrice));
      total.recive=parseInt(total.recive)+(parseInt(result[i].reciveAmount)*parseInt(productList[i].costPrice));
    }
    return total;
  },

  chartData : function(product, productList,year){
    var date=[];
    var sum=0;
    for(var i=0;i<12;sum=0,i++){
      for(var j=0;j<product.length;j++){
        if((i+1)==getDateCunstom.getMonth(product[j].Date.toString().split(" ")[0]) && year==getDateCunstom.getYear(product[j].Date.toString().split(" ")[0])){
          for(var c=0;c<productList.length;c++){
            if(productList[c].productCode == product[j].productCode){
              sum=parseInt(sum)+(parseInt(productList[c].costPrice)*parseInt(product[j].productAmount));
            } }
        }
      }//for j
      date.push(sum);
    }//for i
    return date;
  }
}
