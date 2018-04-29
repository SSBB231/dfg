sap.ui.controller('app.controllers.executor.paginator', {
	onInit: function() {
	},
	onDataRefactor: function(data){
		this.data = data || {};
		this.data.actualPage = this.data.actualPage?this.data.actualPage:1;
		this.data.totalPages = this.data.totalPages?this.data.totalPages:1;
	},
	onAfterRendering: function(html){
		var self = this;
		self.Paginator = $(html);
		self.Paginator.actualPage = self.Paginator.find('.actualPage');
		self.Paginator.totalPages = self.Paginator.find('.totalPages input');
		self.Paginator.first = self.Paginator.find('.btn.icon-btn.icon-left');
		self.Paginator.last = self.Paginator.find('.btn.icon-btn.icon-right');
		self.Paginator.previous = self.Paginator.find('.btn.icon-btn.icon-leftmenu');
		self.Paginator.next = self.Paginator.find('.btn.icon-btn.icon-rightmenu');
		self.currentPages = [];

		self.bindElements();
		self.bindEvents();
		self.bindTooltips();
		//Tooltips are buggy right now so ill leave this commented

		self.moveToPage(self.data.actualPage, true);
	},
	bindElements: function(){
		var self = this;

		self.Paginator.actualPage.ctrl = self.Paginator.actualPage.bindBaseInput({
			tooltip: {
				class: 'dark',
				position: 'top',
				text: i18n('FILL NUMBER PAGE')
			}
		});

		var numbersInBar = self.data.totalPages < 5?self.data.totalPages:5;
		for (var i = numbersInBar-1; i >= 0; i--) {
	 		self.Paginator.previous.after(
	 			$('<div>', {
	 				// tabIndex: '0',
	 				class: 'page-number icon-btn trans btn'
	 			})
	 		);
		};
		self.Paginator.pageNumbers = self.Paginator.find('.page-number.icon-btn.trans.btn');

		self.Paginator.totalPages.val(self.data.totalPages);

	},
	getActualPage: function(){
	    var _self = this;
	    return _self.Paginator.actualPage.ctrl.getText();
	},
	bindEvents: function(){
		var self = this;

		var first = function(){
			if (self.data.actualPage != 1) {
				self.moveToPage(1);
			}else{
				self.Paginator.first.blur();
			};
		}
		self.Paginator.first.click(function(){
			first();
		});
		self.Paginator.first.keypress(function(ev){
			if (ev.keyCode == 32 || ev.keyCode == 13) {
				first();
			};
		});

		var last = function(){
			if (self.data.actualPage != self.data.totalPages) {
				self.moveToPage(self.data.totalPages);
			}else{
				self.Paginator.last.blur();
			};
		}
		self.Paginator.last.click(function(){
			last();
		});
		self.Paginator.last.keypress(function(ev){
			if (ev.keyCode == 32 || ev.keyCode == 13) {
				last();
			};
		});

		var next = function(){
			var next = +self.data.actualPage + 1;

			if (next<=self.data.totalPages) {
				self.moveToPage(next);
				self.Paginator.next.focus();
			}else{
				$(this).blur();
			};
		}
		self.Paginator.next.click(function(){
			next();
		});
		self.Paginator.next.keypress(function(ev){
			if (ev.keyCode == 32 || ev.keyCode == 13) {
				next();
			};
		});

		var previous = function(){
			var previous = +self.data.actualPage - 1;
			if (previous >= 1) {
				self.moveToPage(previous);
				self.Paginator.previous.focus();
			}else{
				$(this).blur();
			};
		}
		self.Paginator.previous.click(function(){
			previous();
		});
		self.Paginator.previous.keypress(function(ev){
			if (ev.keyCode == 32 || ev.keyCode == 13) {
				previous();
			};
		});

		$.each(self.Paginator.pageNumbers, function(index, element){
			$(element).click(function(){
				//self.moveToPage($(element).text());
				self.moveToPage(self.currentPages[index]);
			});
			$(element).keypress(function(ev){
				if (ev.keyCode == 32 || ev.keyCode == 13) {
					// self.moveToPage($(element).text());
					self.moveToPage(self.currentPages[index]);

				};
			});
		});

		self.Paginator.actualPage.find('input').keypress(function(ev, element){
			if (ev.keyCode == 13) {
				let value = $(this).val();
				let values = _.map(self.data.values, function(item){return "" + item;});
				let index = _.indexOf(values, value);
				if(index !== -1){
					self.moveToPage(index + 1);
				}
			};
		});
	},
	moveToPage: function(pageNumber, skipEvents){
		var self = this;
		self.currentPages = [];
		if (pageNumber == self.actualPage && !skipEvents) {
			return;
		};

		var pastPage = self.data.actualPage;
		if (pageNumber > self.data.totalPages || pageNumber < 1) {
			self.Paginator.actualPage.find('input').val(pastPage);
			return;
		};

		self.data.actualPage = pageNumber;

		self.Paginator.pageNumbers.removeClass('active');

		self.Paginator.actualPage.find('input').val(self.data.values[pageNumber-1]);

		var barStartValue;
		var activePlacement;
		if (self.data.actualPage < 3) {
			activePlacement = self.data.actualPage-1;
			barStartValue = 1;
		}else if(self.data.actualPage > self.data.totalPages-2){
			activePlacement = (self.Paginator.pageNumbers.length-1) - (self.data.totalPages-self.data.actualPage);
			barStartValue = self.data.totalPages-(self.Paginator.pageNumbers.length-1);
		}else{
			activePlacement = 2
			barStartValue = self.data.actualPage-2;
		};
		self.Paginator.pageNumbers.eq(activePlacement).addClass('active').focus();

		for(var i = 0; i < self.Paginator.pageNumbers.length; i++){
			self.Paginator.pageNumbers.eq(i).text(self.data.values[barStartValue+i-1]);
			$(self.Paginator.pageNumbers.eq(i)).attr('tabIndex','0');
			self.Paginator.pageNumbers.eq(i).baseTooltip({
				class: 'dark',
				position: 'top',
				text: i18n('CLICK MOVE TO PAGE') +" "+(barStartValue+i)
			});
			self.currentPages.push(barStartValue + i);
			//Tooltips buggy so ill leave this commented
		}

		if (!skipEvents) {
			let actualPage =  self.data.keys ? self.data.keys[self.data.actualPage - 1] :  self.data.actualPage;
			let oldPage = self.data.keys ? self.data.keys[pastPage -1] : pastPage;
			if(self.data.onPageChange){
				self.data.onPageChange(oldPage, actualPage);
			}

			if (self.data["onPage"+self.data.actualPage]) {
				self.data["onPage"+self.data.actualPage](oldPage, actualPage);
			};
		};
	},
	bindTooltips: function(){
		var self = this;
		self.Paginator.first.baseTooltip({
			class: 'dark',
			position: 'top',
			text: i18n('CLICK MOVE TO PAGE')+" 1"
		});
		self.Paginator.next.baseTooltip({
			class: 'dark',
			position: 'top',
			text: i18n('CLICK MOVE NEXT PAGE')
		});
		self.Paginator.previous.baseTooltip({
			class: 'dark',
			position: 'top',
			text: i18n('CLICK MOVE PREVIOUS PAGE')
		});
		self.Paginator.last.baseTooltip({
			class: 'dark',
			position: 'top',
			text: i18n('CLICK MOVE TO PAGE')+" "+self.data.totalPages
		});
	}
});