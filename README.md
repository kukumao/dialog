# dialog
dialog插件

# Usage
```Javascript
var mydialog = new MyDialog({
	cancel: true,
	content: '我是弹出框'
});

mydialog.on('confirm', function(ev) {
	// 确定之后的逻辑代码...
});

myToast.show();
```
