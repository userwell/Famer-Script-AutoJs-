"ui";


ui.layout(
    <vertical weightSum="2">  
        <scroll layout_weight="0.7" layout_height="0dp" margin="15dp"> 
            <text id="log" text="点击开始脚本开始程序\n" layout_width="match_parent" textSize="16sp"/>
        </scroll>

        <linear layout_height="wrap_content" gravity="center">
            <button id="start" text="开始脚本" />
            <button id="end" text="结束脚本" />
            <button id = "check" text="查询土地状况"/>
        </linear>
        <Switch id="chanChuList" text="      开启铲除萝卜苹果" checked="false" textSize="20sp" margin="10dp"/>
        <Switch id="isShiFei" text="      南瓜,草莓施肥" checked="false" textSize="20sp" margin="10dp"/>
        
        <scroll layout_weight="1" layout_height="0dp" margin="15dp">  
            <text id="lowerText" text="....." layout_width="match_parent" textSize="16sp"/>
        </scroll>
    </vertical>
);


let workerThread = null;    // 用于保存子线程的引用
let WaAppleLuo = false;     // 用于是否挖萝卜苹果开关
let WaLandList = ["萝卜","苹果"];            // 这里记录要挖的对象,方便后面更改
let ShiFeiList = ["南瓜","草莓"];    //要施肥的植物列表
let IsShiFei = false;       // 用于记录是否要施肥开关
let dialogSure = true;          // 当前是否可以点击确定
// 返回时间字符串 日期 ➕ 当前时间
function getLocalTime(){
    var result = ""
    var date = new Date().toLocaleDateString(); // 获取当前日期，格式为“2019/10/1”
    var time = new Date().toLocaleTimeString(); // 获取当前时间，格式为“下午/上午 11:01:12”

    result = date + " " +  time;
    return result
}
ui.chanChuList.on("check", function(checked) {
    if(checked) {
        WaAppleLuo = true;
        toastLog("开启铲除")
    }else{
        WaAppleLuo = false;
        toastLog("关闭铲除")
    }
});
ui.isShiFei.on("check",function(checked){
    if(checked){
        IsShiFei = true;
        toastLog("开启施肥")
    }else{
        IsShiFei =false;
        toastLog("关闭施肥")
    }
})
// 开始按钮点击事件
ui.start.click(() => {
    if(scriptStart){
        ui.log.append("当前脚本正在运行,请不要重复运行,请先关闭脚本....\n");
        return;
    }
    console.hide();
    console.show(); 
    //ui.log.setText("")
    //ui.log.append(message + "\n"); 
    ui.log.append("脚本开始时间:"+getLocalTime() + '\n');
    // 在子线程中执行 starts
    workerThread = threads.start(function(){
        starts();
    })
});

// 结束按钮点击事件
ui.end.click(() => {
    if (workerThread) {
        workerThread.interrupt(); // 终止子线程
        workerThread = null;
        toast("脚本已停止");
    } else {
        toast("没有正在运行的脚本");
    }
    if(scriptStart){
        ui.log.append("脚本结束时间:"+getLocalTime() + '\n');
        ui.log.append("=================================\n");
        console.hide();
        scriptStart = false;
    }
    
});
// 输出土地信息，概率 ，数量等
ui.check.click(()=>{
    ui.lowerText.setText(""); // 更新下部文本
    ui.lowerText.append("当前共使用种子: " + String(zhongZiNumber) + " 个\n");
    ui.lowerText.append("\n=======================\n");
    //每块土地铲除的次数
    ui.lowerText.append("土地铲除 萝卜/苹果 次数记录\n");
    var t = 0;
    for(let k in landChanChu_Number){
        ui.lowerText.append(k + "铲除次数为: "+String(landChanChu_Number[k]) + "\n");
        t += landChanChu_Number[k];
    }
    ui.lowerText.append("一共铲除: " + t +" 次\n");

    ui.lowerText.append("\n=======================\n");
    //每块土地种出草莓 南瓜的次数
    var c = 0;
    ui.lowerText.append("每块土地种出南瓜/草莓的次数\n");
    for(let k in landIsCaomeiNangua_number){
        ui.lowerText.append(k + "种出: "+String(landIsCaomeiNangua_number[k]) + "次\n");
        c += landIsCaomeiNangua_number[k];
    }
    ui.lowerText.append("一共出过:"+ c + "次\n");
    ui.lowerText.append("出 草莓/南瓜 的概率为: " + String(parseFloat(c/zhongZiNumber) * 100) + "%\n");
    ui.lowerText.append("\n=======================\n");

    ui.lowerText.append("每块土地种出 西瓜/辣椒 的次数\n");
    c = 0;
    for(let k in landIsLajiaoXigua_number){
        ui.lowerText.append(k + "种出: "+String(landIsLajiaoXigua_number[k]) + "次\n");
        c += landIsLajiaoXigua_number[k];
    }
    ui.lowerText.append("一共出过:"+ c + "次\n");
    ui.lowerText.append("出 辣椒/西瓜 的概率为: " + String(parseFloat(c/zhongZiNumber) * 100) + "%\n");
    ui.lowerText.append("=======================\n");

    //打印水果收获
    ui.lowerText.append("-----本次脚本水果收获----\n");
    for(let key in fruitNumberDict){
        ui.lowerText.append(key+":"+ String(fruitNumberDict[key]) + "个\n");
    }
    ui.lowerText.append("-----------------\n");
    ui.lowerText.append("土地收割时间:");
    ui.lowerText.append(landGetInfo);
})
/**
 * 1.有时候屏幕显示了控件，但是使用查找的方法找不到，
 *      1.1 所看到的控件和当前的窗口不是同一个层次的，这个时候需要设置搜索对象为全部窗口元素。
 *          这个在分屏的情况下也可以使用,选中要搜索的对象是哪一个
            auto.setWindowFilter(function(window){
                //不管是如何窗口，都返回true，表示在该窗口中搜索
                return true;
                //return window.title == "弹出式窗口"
            });
 *      1.2 可能是无障碍缓存的原因，只需要清空无障碍缓存。  
            auto.clearCache()
    2.异步执行
 */

/**
 * 自动种植收割,记录获得的果实数量
 * 等种子发芽会自动铲除苹果和萝卜
 * 
 */

let clickWaitTime = 300 //点击等待时间
let waitTime = 60 * 60 // 最长等待重启时间(秒)
let MaxLandNumber = -1 //拥有最大土地数量 遍历第一遍土地后变为确切的值
let currentClickLand = 1 //当前正在点击的土地对象
let isAppSleep = false //用来设置当前app是否可以睡眠

let zhongZiNumber = 0;  //记录种子使用的数量
let landGetInfo = "";   //土地收割记录(时间+目标土地+品种+数量)
let fruitNumberDict = {'苹果':0,'萝卜':0,'辣椒':0,'西瓜':0,'木瓜':0,'草莓':0,'南瓜':0} //用来记录收获的水果数量
let landChanChu_Number = {};            //记录土地铲除苹果 萝卜的次数
let landIsCaomeiNangua_number = {};     //记录土地是草莓南瓜次数
let landIsLajiaoXigua_number = {};      //记录土地是辣椒西瓜次数
let scriptStart = false;
//获取权限
function getJurisdiction(){
    //打开权限页面
    function openPermissionSettings() {
        let intent = new Intent();
        intent.setAction("android.settings.APPLICATION_DETAILS_SETTINGS");
        intent.setData(android.net.Uri.fromParts("package", context.getPackageName(), null));
        // 添加 FLAG_ACTIVITY_NEW_TASK 标志
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }
    
    //获取无障碍权限
    auto.waitFor()
    ///获取悬浮窗权限
    if(!floaty.checkPermission()){
        app.startActivity({
            packageName: "com.android.settings",
            className: "com.android.settings.Settings$AppDrawOverlaySettingsActivity",
            data: "package:" + context.getPackageName(),
        });
        
    }
    // 首先尝试获取 "读取应用列表" 权限，不然无法查找到app，也就无法打开app
    if (!runtime.requestPermissions(["android.permission.GET_TASKS"])) {
        // 如果权限请求失败，引导用户手动授予权限
        toast("权限获取失败，将引导您手动设置权限");
        openPermissionSettings();
    }
}

// ====================
function loop(){
    while(true){
        auto.clearCache() //清空无障碍缓存。
        //加载页面
        sleep(2000)
        let num = currentPage()
        console.info("当前页面 " + num + " .")
        if(num == null){
            //如果都没有,则等待俩秒，如果还是没有，则重启app,所有设置重置
            sleep(2000)
            auto.clearCache() //清空控件缓存
            if(currentPage() == null){
                openApp("信之通") //重启app
            }
        }else{
            todoNext(num)
        }
        
        if(isAppSleep){
            isAppSleep = false
            console.info("开始计时")
            console.info("waitTime " + waitTime +  " 秒 = "+parseInt(waitTime/60)+" 分钟")
            //大于三分钟睡眠等待重启
            //waitTime = 181
            if(waitTime > 180){
                home()
                console.info("等待重启")
                sleepWaitCountTime(waitTime)
                openApp("信之通") //重启app
            }else{
                sleepWaitCountTime(waitTime)
                waitTime = 60 * 60 //重置最长睡眠时间
                
            }     
        }
    }
}

function starts(){
    varInit() //初始化变量
    getJurisdiction(); //获取权限
    sleep(3000)
    
    console.show()
    console.warn("当前程序需要开启无障碍模式,悬浮窗权限,以及读取应用列表权限")
    console.info("程序有任何问题请联系我qq: 3084291707");
    console.warn("该产品请不要传播,后果自负！！")
    sleep(2000);
    home();
    loop()
}
//返回当前属于哪一个页面
function currentPage(){
    //1.打开农场app弹出窗口等待点击 × (id("ads_close") id("ads_recycler"))
    // 这里以整体窗口id为条件
    if(id("ads_recycler").exists()) 
        return 1
    //2.当前页面在app-我的
    if(id("mine_farm").exists() || text("我的团队").exists() || id("mine_setting").exists()) 
        return 2
    //3.在app主页面(没有窗口)(当前页面不在 我的 页面)
    if(text("首页").exists() && text("广场").exists() && 
        text("聊天").exists() && text("我的").exists()) 
        return 3
    //4.农场打开等待点击确认
    if(id("dialog_sure").exists() && dialogSure ) 
        return 4
    //5.当前页面在农场
    if(id("farm_land_1_click").exists() && id("farm_kuangshan").exists())
        return 5
    //6.当前页面在农场-矿山(农夫,领取种子)
    if(id("farm_back_mine_farm_img").exists() && id("farmer_mining_receive_tv").exists())
        return 6
    //7.当前页面为登陆页面
    if(id("lp_check_img").exists() && text("微信登录").exists() && text("验证码登录").exists())
        return 7
    if(text("开始脚本").exists() && text("结束脚本").exists())
        return 8;
    if(text("选择化肥").exists())
        return 9;
    return null
}
function todoNext(number){
    sleep(1000)
    switch(number){
        case 1:
            todo1()
            break;
        case 2:
            todo2()
            break;
        case 3:
            todo3()
            break;
        case 4:
            todo4()
            break;
        case 5:
            todo5()
            // 再次点击一下展开(点击第四块土地后，再次点击第一块土地有bug,
            // 不会显示第一块土地的信息，而是将第四块土地的信息没了)
            // 所以这里每次点击一次土地后然后点击一次展开
            clickIDobjectBounds("展开","farm_open_img",clickWaitTime)
            break;
        case 6:
            todo6()
            break;
        case 7:
            todo7()
            break;
        case 8:
            todo8();
            break;
        case 9:
            todo9();
    }
    return true
}

function varInit(){
    //保持屏幕常亮，但允许屏幕变暗来节省电量。 如果此函数调用时屏幕没有点亮，则会唤醒屏幕。
    device.keepScreenDim() 
    waitTime = 60 * 60 
    MaxLandNumber = -1
    currentClickLand = 1 
    isAppSleep = false 
    scriptStart = true;
    dialogSure = true;
}
// =========================

// 1.打开农场窗口点击×
function todo1(){
    sleep(2000) //等待×出现
    if(!clickIDobject("叉叉","ads_close",clickWaitTime))
        clickIDobjectBounds("叉叉","ads_close",clickWaitTime)
}
//2.当前页面在app-我的
function todo2(){
    if(!clickIDobject("我的农场","mine_farm",clickWaitTime))
        clickIDobjectBounds("我的农场","mine_farm",clickWaitTime)
}
//3.当前页面在主页面，我们让他点击 我的
function todo3(){
    if(!clickIDobject("主页我的","fourth",clickWaitTime))
        clickIDobjectBounds("主页我的","fourth",clickWaitTime)
}
//4.进入农场点击确认
function todo4(){
    if(!clickIDobject("我知道-确认","dialog_sure",clickWaitTime))
        clickIDobjectBounds("我知道-确认","dialog_sure",clickWaitTime)
}
//5.当前页面在农场
let lastLandInfo = "";
function todo5(){
    //设置所有窗口选择
    auto.setWindowFilter(function(window){
        //不管是如何窗口，都返回true，表示在该窗口中搜索
        return true;
        //return window.title == "弹出式窗口"
    });
    //currentlandName = currentClickLand % MaxLandNumber
    let idName = "farm_land_"+currentClickLand+"_click"
    let currentlandName = "第 "+currentClickLand+" 块土地"
    //初始化俩个字典表
    if(!(currentlandName in landIsCaomeiNangua_number) ) landIsCaomeiNangua_number[currentlandName] = 0;
    if(!(currentlandName in landIsLajiaoXigua_number) ) landIsLajiaoXigua_number[currentlandName] = 0;
    if(!(currentlandName in landChanChu_Number)) landChanChu_Number[currentlandName] = 0;

    if(clickIDobjectBounds(currentlandName,idName,clickWaitTime)){
        sleep(1000) 
        //1.如果需要播种
        let bozhong = id("land_bozhong").findOne(clickWaitTime)
        if(bozhong){
            bozhong.click()
            console.log(currentlandName+" 已经种植")
            zhongZiNumber++;    //增加种子消耗数量
            currentClickLand++;
            waitTime = waitTime > (30 * 60) ? (30 * 60) : waitTime; 
            return;
        }
        //这里有时候卡了施肥和收割会同时显示，但是实际状态是已经可以收割了
        //2.当前土地可以收割了
        let shouge = id("land_shouge").findOne(clickWaitTime)
        if(shouge){
            shouge.click()
            console.log(currentlandName + "收割了一次");
            //收割完当前土地还有操作,所以不进行加一
            //id("dialog_content").findOne() 收获70个...
            //记录收割的数量
            let s = id("dialog_content").findOne(clickWaitTime + 1000);
            if(s){
                let title = s.text();
                if(title.includes("草莓") || title.includes("南瓜"))
                    landIsCaomeiNangua_number[currentlandName]++;
                if(title.includes('辣椒') || title.includes('西瓜'))
                    landIsLajiaoXigua_number[currentlandName]++;
                RecordFruitQuantity(title);
            }
            return;
        }

        //3.如果当前土地已经有蔬菜正在种植
        //当前种子还在发芽阶段，那么他就不会显示铲除，会显示发芽倒计时和施肥
        let landinfo = id("popup_text").findOne(clickWaitTime);
        if(landinfo){ 
            console.log(currentlandName + " "+ landinfo.text())
            var t = landinfo.text();
            var time = hasTime(t) ? parseTimeToSeconds(t) : null; 
            if(WaAppleLuo){
                //铲除萝卜苹果
                for(var index in WaLandList){
                    if(t.includes(WaLandList[index])){
                        var chanchu = id("land_chanchu").findOne(clickWaitTime);
                        if(chanchu){
                            chanchu.click();
                            //增加铲除的信息
                            landChanChu_Number[currentlandName]++;
                        }
                        return;
                    }
                }
            }

            var shifei = id("land_shifei").findOne(clickWaitTime)
            if(IsShiFei && !t.includes("发芽") && shifei){
                //对列表内水果施肥
                for(var index in ShiFeiList){
                    if(t.includes(ShiFeiList[index])){
                        dialogSure = false;
                        //点击施肥
                        if(shifei) shifei.click();
                        currentClickLand++;
                        todo9();
                    }
                }
            }
            if(time != null){
               waitTime = waitTime > time ? time : waitTime; 
            }
            currentClickLand++;
            return;
        }

        //4.铲除开始种植
        chanchu = id("land_chanchu").findOne(clickWaitTime)
        //施肥后 只会显示土地信息和铲除 俩个
        if(chanchu && (!id("land_shifei").findOne(clickWaitTime) && (!id("popup_text").findOne(clickWaitTime) ))){
            console.log(currentlandName + "需要铲除....");
            chanchu.click()
            //铲除完当前土地还有操作,所以不进行加一
            return
        }  
        //5. 显示种子数量不足       
        //种子不足只会显示种子数量不足，不会有任何弹窗
    }else{
        back();back();return;
    }
    // 当前为点击土地但是没有任何信息弹跳出来
    //当第二次遍历土地时进入睡眠
    if(MaxLandNumber == currentClickLand - 1){
        isAppSleep = true;
    }
    MaxLandNumber = currentClickLand - 1;
    console.log("当前拥有的最大土地数量为 " + MaxLandNumber)
    //ui.log.append("当前拥有的最大土地数量为 " + MaxLandNumber)
    currentClickLand = 1
    
}

//6.当前页面在矿山
function todo6(){
    //点击领取 id("farmer_mining_receive_tv")
    clickIDobject("种子领取","farmer_mining_receive_tv",clickWaitTime)
    //点击我的家园id("farm_back_mine_farm_img")
    clickIDobject("我的家园","farm_back_mine_farm_img",clickWaitTime)
}
//7.当前在登陆页面
function todo7(){
    //点击 已阅读并同意 id("lp_check_img")
    clickIDobject("已阅读并同意","lp_check_img",clickWaitTime)
    //然后进入阻塞，一直等待有对应的页面出现
    while(true){
        let pn = currentPage()
        sleep(5000)
        if(pn != null && pn != 7)
            break
        console.info("等待用户登录APP")
    }
     
}
//当前在脚本ui页面
function todo8(){
    sleep(2000);
    return;
}
//当前页面是农场内选择化肥
function todo9(){
    if(!IsShiFei) return;
    dialogSure = true;
    // 选择普通化肥1
    let putong = id("radio_putong").findOne(clickWaitTime);
    if(putong){
        console.log(putong.text())
        putong.click();
        waitTime -= 60 * 60 * 3;
    }else{
        // 没有普通化肥就取消
        var cancel = id("dialog_cancel").findOne(clickWaitTime);
        if(cancel) cancel.click();
    }
}





// ===========================
//点击id对象 结果打印在控制台
function clickIDobjectBounds(title,idName,time) {
    sleep(2000)
    let ob = id(idName).findOne(time)
    if(ob){
        console.log("click " + title + " 坐标success")
        let bound = ob.bounds()
        click(bound.centerX(),bound.centerY())
        //ob.click()
        return true
    }else{
        console.log("click " + title + " 坐标fault")
        return false
    }
}
function clickIDobject(title,idName,time){
    sleep(2000)
    //console.log("idName "+idName+" time "+time)
    let ob = id(idName).findOne(time)
    if(ob){
        if(!ob.clickable()){
            console.info(title + "是不可点击对象")
            return false
        }
        ob.click()
        console.log("click "+title+" success")
        return true
    }else{
        console.log("click " + title + " fault")
        return false
    }

}
// ---------------------------
function killApp(name) {
    auto.clearCache()
    let forcedStopStr = ["停", "强", "结束"];
    let packageName = app.getPackageName(name);
    console.log(name + ": " + packageName)
    if (packageName) {
        app.openAppSetting(packageName);
        //sleep(2000)
        text("卸载").untilFind();
        //模糊查找
        for (var i = 0; i < forcedStopStr.length; i++) {
            let forcedStop = textContains(forcedStopStr[i]).findOne(2000);
            if(!forcedStop) continue;
            if(forcedStop.enabled()) {
                forcedStop.click();
                sleep(1000)
                //有些手机是 点击确定,有些是强行停止等其他操作
                forcedStopStr = ["强行停止", "确认","确定"]
                //精确查找
                for (var i = 0; i < forcedStopStr.length; i++){
                    textContains(forcedStopStr[i]).find(2000).forEach(function(element, index){
                        if(element.text() == forcedStopStr[i]){
                            element.click();
                        }
                    });
                }
                console.log(name + "已结束运行")
                sleep(800);
                back();
                break;
            }else{
                console.log(name + "不在后台运行")
                return;
            }
        }
    }else{
        console.log("没有找到app: " + name);
    }
    //exit();
}
//返回到桌面，重新打开app
function openApp(appName){
    //如果要重新计算,那么就要重新设置值
    varInit()
    //返回到主桌面
    home()
    sleep(5000)
    //清理当前app后台 重新进入app
    killApp(appName)
    //打开app
    if(!app.launchApp(appName)){
        console.log(appName + " App open fault")
        return false
    } 
    else{
        console.log(appName + " App open success")
        return true
    }
}


//从文字中找出字符串时间 转换为整数时间 秒数
function parseTimeToSeconds(str) {
    // 去除字符串中的换行符和空格，以便准确匹配
    let cleanStr = str.replace(/\s/g, '');
    let match = cleanStr.match(/\d+:\d+(?::\d+)?/);
    if (!match) {
        return null;
    }
    let parts = match[0].split(':');
    let hours = 0;
    let minutes = parseInt(parts[0]);
    let seconds = parseInt(parts[1]);
    if (parts.length === 3) {
        hours = parseInt(parts[0]);
        minutes = parseInt(parts[1]);
        seconds = parseInt(parts[2]);
    }
    return hours * 3600 + minutes * 60 + seconds;
}
//判断字符串是否有时间
function hasTime(str) {
    // 正则表达式匹配时间格式，格式为：数字:数字，其中数字可以是1位或多位，并且支持冒号后再跟数字的情况
    let regex = /\d+:\d+(?::\d+)?/;
    return regex.test(str);
}
//睡眠倒计时 单位为秒
function sleepWaitCountTime(time){
    let countTime = 0;
    while(countTime < time){
        //每过三秒log一次
        console.info("剩余时间 :" + (time - countTime) + " 秒")
        sleep(6000)
        countTime += 6
    }
}

//记录收获的水果数量
function RecordFruitQuantity(title){
    for(let key in fruitNumberDict){
        if(title.includes(key)){
            let number = title.match(/-?\d+/);
            fruitNumberDict[key] = parseInt(fruitNumberDict[key]) + parseInt(number);
            console.log("获得水果品种:" + key + ",数量:" + number + "个");
            //ui.log.append(getLocalTime() +" 获得水果品种:" + key + ",数量:" + number + "个\n" );

            landGetInfo += getLocalTime() + "->获得水果品种: " + key + ",数量:" + number + "个\n";
            return;
        }
    }
}

// 土地 ===========
