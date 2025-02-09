let waitTime = 400
function start(){
    // radio_putong
    // radio_chaoji
    // radio_mini
    if(!text("选择化肥").exists()) return;
    let putong = id("radio_putong").findOne(waitTime);
    if(putong){
        console.log(putong.text())
        putong.click();
    }
    sleep(2000);
    let chaoji = id("radio_chaoji").findOne(waitTime)
    if(chaoji){
        console.log(chaoji.text());
        chaoji.click();
    }
    sleep(2000);
    let mini = id("radio_mini").findOne(waitTime)
    if(mini){
        console.log(mini.text())
        mini.click()
    }
    sleep(2000);
}


while(true){

    for(var i=1;i<5;i++){
        var n = "farm_land_" + String(i) + "_click";
        console.log(n)
        id(n).findOne(1000).click();       
        sleep(1000)
    }
    //start();
}