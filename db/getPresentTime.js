
module.exports={
  getCurentTime : function(){
    var d = new Date();
    var presentTime = d.getFullYear()+"-"+(d.getMonth() + 1)+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
    return presentTime;
  },
  getYear :function(dates){
    return (new Date(dates).getFullYear());
  },
  getMonth:function(dates){
    return (new Date(dates).getMonth())+1;
  }
}
