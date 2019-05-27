/**
 * =================================================
 * dialog
 * Created by zhouck on 2016/04/22
 * =================================================
 */
;
(function(undefined) {
	"use strict"
	var _global;

	/*工具函数 -start*/
	// 对象合并
	function extend(o, n, override) {
		for(var key in n) {
			if(n.hasOwnProperty(key) && (!o.hasOwnProperty(key) || override)) {
				o[key] = n[key];
			}
		}
		return o;
	}
	// 通过class查找dom
	if(!('getElementsByClass' in HTMLElement)) {
		HTMLElement.prototype.getElementsByClass = function(n) {
			var el = [],
				_el = this.getElementsByTagName('*');
			for(var i = 0; i < _el.length; i++) {
				if(!!_el[i].className && (typeof _el[i].className == 'string') && _el[i].className.indexOf(n) > -1) {
					el[el.length] = _el[i];
				}
			}
			return el;
		};
		((typeof HTMLDocument !== 'undefined') ? HTMLDocument : Document).prototype.getElementsByClass = HTMLElement.prototype.getElementsByClass;
	}
	/*工具函数 -end*/
	
	// 插件构造函数 - 返回数组结构
	function MyDialog(opt) {
		this._initial(opt);
	}
	MyDialog.prototype = {
		constructor: this,
		_initial: function(opt) {
			// 默认参数
			var def = {
				ok: true,
				ok_txt: '确定',
				cancel: false,
				cancel_txt: '取消',
				confirm: function() {},
				close: function() {},
				content: ''
			};
			// 配置参数
			this.def = extend(def, opt, true);
			// 获取模板字符串
			this.tpl = this._getTpl();
			// 将字符串转为dom
			this.dom = this._parseToDom(this.tpl)[0];
			// 检查dom树中dialog的节点是否存在
			this.hasDom = false;
			//自定义事件，用于监听插件的用户交互
			this.listeners = [];
			this.handlers = {};
		},
		// 获取模板字符串
		_getTpl: function() {
			let str;
			if(this.def.cancel) {
				str = `<div class="z-dialog">
				<span class="z-dialog-close">×</span>
				<div class="z-dialog-content">
					<div class="content-txt">
						${this.def.content}
					</div>
				</div>
				<div class="z-dialog-footer">
					<span class="z-dialog-btn z-dialog-btn-ok">${this.def.ok_txt}</span>
					<span class="z-dialog-btn z-dialog-btn-cancel">${this.def.cancel_txt}</span>
				</div>
			</div>`;
			} else {
				str = `<div class="z-dialog">
				<span class="z-dialog-close">×</span>
				<div class="z-dialog-content">
					<div class="content-txt">
						${this.def.content}
					</div>
				</div>
				<div class="z-dialog-footer">
					<span class="z-dialog-btn z-dialog-btn-ok" style="width: 100%">${this.def.ok_txt}</span>
				</div>
			</div>`;
			}
			return str;
		},
		// 将字符串转为dom
		_parseToDom: function(str) {
			var div = document.createElement('div');
			if(typeof str == 'string') {
				div.innerHTML = str;
			}
			return div.childNodes;
		},
		// 显示弹框
		show: function(callback) {
			var _this = this;
			if(this.hasDom) return;
			if(this.listeners.indexOf('show') > -1) {
				if(!this.emit({
						type: 'show',
						target: this.dom
					})) return;
			}
			document.body.appendChild(this.dom);
			this.hasDom = true;
			this.dom.getElementsByClass('close')[0].onclick = function() {
				_this.hide();
				if(_this.listeners.indexOf('close') > -1) {
					_this.emit({
						type: 'close',
						target: _this.dom
					})
				}
				!!_this.def.close && _this.def.close.call(this, _this.dom);
			};
			this.dom.getElementsByClass('btn-ok')[0].onclick = function() {
				_this.hide();
				if(_this.listeners.indexOf('confirm') > -1) {
					_this.emit({
						type: 'confirm',
						target: _this.dom
					})
				}
				!!_this.def.confirm && _this.def.confirm.call(this, _this.dom);
			};
			if(this.def.cancel) {
				this.dom.getElementsByClass('btn-cancel')[0].onclick = function() {
					_this.hide();
					if(_this.listeners.indexOf('cancel') > -1) {
						_this.emit({
							type: 'cancel',
							target: _this.dom
						})
					}
				};
			}
			callback && callback();
			if(this.listeners.indexOf('shown') > -1) {
				this.emit({
					type: 'shown',
					target: this.dom
				})
			}
			return this;
		},
		// 隐藏弹框
		hide: function(callback) {
			if(this.listeners.indexOf('hide') > -1) {
				if(!this.emit({
						type: 'hide',
						target: this.dom
					})) return;
			}
			document.body.removeChild(this.dom);
			this.hasDom = false;
			callback && callback();
			if(this.listeners.indexOf('hidden') > -1) {
				this.emit({
					type: 'hidden',
					target: this.dom
				})
			}
			return this;
		},
		// 注册事件
		on: function(type, handler) {
			// type: show, shown, hide, hidden, close, confirm
			if(typeof this.handlers[type] === 'undefined') {
				this.handlers[type] = [];
			}
			this.listeners.push(type);
			this.handlers[type].push(handler);
			return this;
		},
		// 取消已注册事件
		off: function(type, handler) {
			if(this.handlers[type] instanceof Array) {
				var handlers = this.handlers[type];
				for(var i = 0, len = handlers.length; i < len; i++) {
					if(handlers[i] === handler) {
						break;
					}
				}
				this.listeners.splice(i, 1);
				handlers.splice(i, 1);
				return this;
			}
		},
		// 触发事件
		emit: function(event) {
			if(!event.target) {
				event.target = this;
			}
			if(this.handlers[event.type] instanceof Array) {
				var handlers = this.handlers[event.type];
				for(var i = 0, len = handlers.length; i < len; i++) {
					handlers[i](event);
					return true;
				}
			}
			return false;
		}
	}

	// 最后将插件对象暴露给全局对象
	_global = (function() {
		return this || (0, eval)('this');
	}());
	if(typeof module !== "undefined" && module.exports) {
		module.exports = MyDialog;
	} else if(typeof define === "function" && define.amd) {
		define(function() {
			return MyDialog;
		});
	} else {
		!('MyDialog' in _global) && (_global.MyDialog = MyDialog);
	}
}());