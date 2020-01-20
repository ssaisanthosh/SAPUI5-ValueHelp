# Controller Code

    					let _companyCodeVH = new ValueHelp(that);
					_companyCodeVH.setEntitySet("/CompanyCodeSet");
					_companyCodeVH.setEntity("CompanyCode");
					_companyCodeVH.setInput(that.getView()
						.byId("CompanyCode"));
					_companyCodeVH.setKey("Bukrs");
					_companyCodeVH.setDescriptionKey("Butxt");
					_companyCodeVH.setTitle("Company Code");
					_companyCodeVH.setFilter(["Bukrs", "Butxt"]);
					_companyCodeVH.open();

# Files

    /*!
 * ValueHelp
 * Sai Santhosh (10664929) <sai.santhosh@lntinfotech.com>
 * MIT @2020
 */
sap.ui.define(
	[
		"sap/ui/base/Object",
		"sap/m/Button",
		"sap/m/Dialog",
		"sap/m/ButtonType",
		"sap/m/Text",
		"sap/ui/comp/valuehelpdialog/ValueHelpDialog",
		"sap/m/SearchField",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	],
	function (Object, Button, Dialog, ButtonType, Text, ValueHelpDialog, SearchField, Filter, FilterOperator) {
		"use strict";
		var ValueHelp = Object.extend(
			"pih.refx.contractOffer.control.valueHelp", {
				/**
				 * Constructor
				 * @param {any} t Parent Class
				 */
				constructor: function (t) {
					this._this = t;
				},

				setEntitySet: function (sEntity) {
					this._sEntitySet = sEntity;
				},

				setEntity: function (sEntity) {
					this._sEntity = sEntity;
				},

				setKey: function (key) {
					this._key = key;
				},

				setDescriptionKey: function (key) {
					this._descriptionKey = key;
				},

				setTitle: function (title) {
					this._title = title;
				},

				setFilter: function (filter) {
					this._filter = filter;
				},

				setInput: function (inputField) {
					this._inputField = inputField;
				},

				open: function () {
					let _this = this,
						fnSuccess = function (oEvent) {
							let fnOk = function (oControlEvent) {
									var aTokens = oControlEvent.getParameter("tokens");
									_this._inputField.setValue(aTokens[0].getKey());
									_this._inputField.setDescription(aTokens[0].getText());
									oControlEvent.getSource()
										.close();
								},
								fnCancel = function (oControlEvent) {
									oControlEvent.getSource()
										.close();
								},
								fnAfterClose = function (oControlEvent) {
									oControlEvent.getSource()
										.destroy();
								},
								oSearchHelpProperty = {
									data: oEvent,
									key: _this._key,
									descriptionKey: _this._descriptionKey,
									title: _this._title,
									filter: _this._filter
								};
							_this._loadSearchHelp(fnOk, fnCancel, fnAfterClose, oSearchHelpProperty);
						},
						fnError = function (oError) {
							jQuery.sap.log.info("Error failed." + oError);
						};
					_this._read(this._sEntitySet, fnSuccess, fnError);
				},

				// ss
				_loadSearchHelp: function (fnOk, fnCancel, fnAfterClose, oSearchHelpProperty) {
					const that = this._this,
						_this = this;
					let oValueHelpDialog = new ValueHelpDialog({
							title: oSearchHelpProperty.title,
							supportMultiselect: false,
							supportRanges: false,
							supportRangesOnly: false,
							key: oSearchHelpProperty.key,
							descriptionKey: oSearchHelpProperty.descriptionKey,
							stretch: sap.ui.Device.system.phone,
							ok: fnOk,
							cancel: fnCancel,
							afterClose: fnAfterClose
						}),
						jColumn = new sap.ui.model.json.JSONModel({
							cols: _this._getEntityProperty(_this._sEntity)
						});
					oValueHelpDialog.getTableAsync()
						.then(function (oTable) {
							oTable.setModel(new sap.ui.model.json.JSONModel(oSearchHelpProperty.data));
							oTable.setModel(jColumn, "columns");
							if (oTable.bindRows) {
								oTable.bindAggregation("rows", "/results");
							}
							if (oTable.bindItems) {
								oTable.bindAggregation("items", "/results", function () {
									return new ColumnListItem({
										cells: aCols.map(function (column) {
											return new Label({
												text: "{" + column.template + "}"
											});
										})
									});
								});
							}
							oValueHelpDialog.update();
						}.bind(this));

					var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
						advancedMode: true,
						filterBarExpanded: false,
						showGoOnFB: !sap.ui.Device.system.phone,
						search: function (s) {
							let _searchValue = oValueHelpDialog.getFilterBar()
								.getBasicSearchValue();
							_this._getValueHelpDialogSearchHelp(_searchValue, oSearchHelpProperty, oValueHelpDialog);
						}
					});

					if (oFilterBar.setBasicSearch) {
						oFilterBar.setBasicSearch(new sap.m.SearchField({
							showSearchButton: sap.ui.Device.system.phone,
							placeholder: "Search",
							search: function (event) {
								let sSearchQuery = event.getParameter("query");
								_this._getValueHelpDialogSearchHelp(sSearchQuery, oSearchHelpProperty, oValueHelpDialog);
							}
						}));
					}
					oValueHelpDialog.setFilterBar(oFilterBar);

					// var oToken = new Token();
					// oToken.setKey(this._oInput.getSelectedKey());
					// oToken.setText(this._oInput.getValue());
					// this._oValueHelpDialog.setTokens([oToken]);
					oValueHelpDialog.open();

				},

				_getValueHelpDialogSearchHelp: function (sSearchQuery, oSearchHelpProperty, oValueHelpDialog) {
					let aFilters = [],
						aFiltersList = [];
					$.each(oSearchHelpProperty.filter, function (i, v) {
						aFiltersList.push(new Filter({
							path: v,
							operator: FilterOperator.Contains,
							value1: sSearchQuery
						}));
					});

					aFilters.push(new Filter({
						filters: aFiltersList,
						and: false
					}));

					oValueHelpDialog.getTableAsync()
						.then(function (oTable) {
							if (oTable.bindRows) {
								oTable.getBinding("rows")
									.filter(aFilters);
							}
							if (oTable.bindItems) {
								oTable.getBinding("items")
									.filter(aFilters);
							}
							oValueHelpDialog.update();
						});
				},

				_getEntityProperty: function (EntitySet) {
					const that = this._this,
						aEntityType = that.getOwnerComponent()
						.getModel()
						.getServiceMetadata()
						.dataServices.schema[0].entityType;
					let oEntity, aProperty, acols = [];
					oEntity = aEntityType.find(o => o.name === EntitySet);
					aProperty = oEntity.property;
					$.each(aProperty, function (i, v) {
						let aExtensions = v.extensions,
							label;
						label = aExtensions.find(o => o.name === "label");
						acols.push({
							label: label.value,
							template: v.name
						});
					});
					return acols;
				},

				_read: function (EntitySet, fnSuccess, fnError) {
					const that = this._this;
					that.getOwnerComponent()
						.getModel()
						.read(EntitySet, {
							success: fnSuccess,
							error: fnError
						});
				}
			}
		);
		return ValueHelp
		});
