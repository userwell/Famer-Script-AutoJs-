"ui";
ui.layout(
    <vertical>
        <Switch id="autoService" text="无障碍服务" checked="false" textSize="20sp" switchMinWidth="10dp"/>
        <button text="第二个按钮"/>
    </vertical>
);
ui.autoService.on("check", function(checked) {
    if(checked) {
        toastLog("开")
    }else{
        toastLog("关")
    }
});
