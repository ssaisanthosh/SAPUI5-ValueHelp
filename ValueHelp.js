/*!
 * ValueHelp for oData and ajax Call
 * Version: 1.0.3 
 */
sap.ui.define(["sap/ui/core/Control", "sap/ui/comp/valuehelpdialog/ValueHelpDialog"], function (Control, ValueHelpDialog) {
  "use strict";

  var valueHelp = Control.extend("<<your_project_name>>.valueHelp", {
    metadata: {
      properties: {
        /** Title for Search Help */
        title: {
          type: "string",
          defaultValue: "Search Help",
        },

        /** Entity Name of the oData Service  */
        entity: {
          type: "string",
        },

        noDataText: {
          type: "string",
        },

        busyIndicator: {
          type: "string",
        },

        condition: {
          type: "object[]",
        },

        key: {
          type: "string",
        },

        input: {
          type: "any",
        },
        dependBinding: {
          type: "array",
        },
        dependValue: {
          type: "array",
        },

        filter: {
          type: "array",
        },
        dataSource: {
          type: "string",
        },
        columns: {
          type: "array",
        },
        ajaxCall: {
          type: "boolean",
        },
        modelPath: {
          type: "string",
        },
      },

      aggregations: {
        /** hidden aggregation for the ValueHelpDialog */
        _searchHelpDialog: {
          type: "sap.ui.comp.valuehelpdialog.ValueHelpDialog",
          multiple: false,
          visibility: "hidden",
        },
      },

      associations: {
        /** The targetControl (sap.m.Input) this control is used with */
        targetControl: {
          type: "sap.m.Input",
          multiple: false,
        },
      },

      events: {
        /**
         * fired when an entry of the ValueHelpDialog is After
         * Processing Extending Selection Item Done */
        afterSelected: {
          parameters: {
            value: {
              type: "any",
            },
          },
        },
        /** fired when an entry of the ValueHelpDialog is selected */
        selected: {},
        /** fired when the ValueHelpDialog is canceled */
        canceled: {},
      },
    },

    init: function () {
      var oControl = this;
    },
  });

  valueHelp.prototype.open = function () {
    this._read();
  };

  valueHelp.prototype._getSearchHelpDialog = function () {
    const that = this;
    if (!that.getAggregation("_searchHelpDialog")) {
      let fnSearch = function (oEvent, bProductSearch) {
          that._read(true, oEvent.getParameter("value"));
        },
        fnConfirm = function (oEvent) {
          let sPath = oEvent.getSource().getTable().getSelectedIndex(),
            oData = oEvent.getSource().getTable().getModel().getData().results[sPath];
          sap.ui.getCore().byId(that.getInput()).setValue(oData[that.getKey()]);
          if (that.getDependBinding() !== undefined) {
            that.getDependBinding().forEach((value, i) => {
              let sPath = sap.ui.getCore().byId(that.getInput()).getBindingContext("items").getPath(),
                aRow = sap.ui.getCore().byId(that.getInput()).getParent().getModel("items").getProperty(sPath);
              if (typeof value === "string" || value instanceof String) {
                aRow[value] = oData[value];
              } else {
                aRow[value[Object.keys(value)[0]]] = oData[Object.keys(value)[0]];
              }
            });
            sap.ui.getCore().byId(that.getInput()).getParent().getModel("items").refresh();
          }
          if (that.getDependValue() !== undefined) {
            that.getDependValue().forEach(function (value) {
              sap.ui.getCore().byId(value.id).setValue(oData[value.field]);
            });
          }
          sap.ui.getCore().byId(that.getInput()).setValueState("None");
          oEvent.getSource().close();
          that.fireEvent("afterSelected", {
            value: oEvent,
          });
        },
        fnCancel = function (oEvent) {
          oEvent.getSource().close();
        },
        fnAfterClose = function (oEvent) {
          oEvent.getSource().destroy();
        },
        oSearchHelpDialog = new ValueHelpDialog({
          title: that.getTitle(),
          supportMultiselect: false,
          supportRanges: false,
          supportRangesOnly: false,
          stretch: sap.ui.Device.system.phone,
          ok: fnConfirm,
          cancel: fnCancel,
          afterClose: fnAfterClose,
        });

      var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
        advancedMode: true,
        filterBarExpanded: false,
        showGoOnFB: !sap.ui.Device.system.phone,
        search: function (s) {
          let _searchValue = oSearchHelpDialog.getFilterBar().getBasicSearchValue();
          that._read(true, _searchValue);
        },
      });

      if (oFilterBar.setBasicSearch) {
        oFilterBar.setBasicSearch(
          new sap.m.SearchField({
            showSearchButton: sap.ui.Device.system.phone,
            placeholder: "Search",
            search: function (event) {
              let sSearchQuery = event.getParameter("query");
              that._read(true, sSearchQuery);
            },
          })
        );
      }
      oSearchHelpDialog.setFilterBar(oFilterBar);
      this.setAggregation("_searchHelpDialog", oSearchHelpDialog);
    }
    return this.getAggregation("_searchHelpDialog");
  };

  valueHelp.prototype._getColumnTemplates = function () {
    const that = this,
      acols = [];
    if (that.getAjaxCall() !== undefined && that.getAjaxCall()) {
      if (that.getColumns() !== undefined) {
        $.each(that.getColumns(), function (i, v) {
          acols.push({
            label: v.name,
            template: v.field,
            width: v.width === undefined ? "14rem" : v.width,
          });
        });
      }
    } else {
      const aEntityType = that.getModel(that.getModelPath()).getServiceMetadata().dataServices.schema[0].entityType;
      let oEntity, aProperty, sEntityName;
      if (
        that
          .getEntity()
          .substring(that.getEntity().length - 3)
          .toLowerCase() === "set"
      ) {
        sEntityName = that.getEntity().substring(0, that.getEntity().length - 3);
      } else {
        sEntityName = that.getEntity();
      }
      oEntity = aEntityType.find((o) => o.name === sEntityName);
      aProperty = oEntity.property;
      if (this.getColumns() === undefined) {
        $.each(aProperty, function (i, v) {
          let aExtensions = v.extensions,
            label;
          label = aExtensions.find((o) => o.name === "label");
          acols.push({
            label: label.value,
            template: v.name,
            width: "8rem",
          });
        });
      } else {
        $.each(this.getColumns(), function (i, v) {
          acols.push({
            label: v.name,
            template: v.field,
            width: v.width,
          });
        });
      }
    }
    return acols;
  };
  valueHelp.prototype.Condition = {
    Integer: "Int",
  };
  valueHelp.prototype._read = function (oFilterSearch, oFilterValue) {
    const that = this;
    let oFilters = [],
      saFilter = [],
      sFilter = "?$filter=",
      oSearchHelpDialog = that._getSearchHelpDialog();
    $.each(that.getCondition(), function (i, v) {
      if (that.getAjaxCall() !== undefined && that.getAjaxCall()) {
        if (v.type !== undefined) {
          if (v.type === valueHelp.prototype.Condition.Integer) {
            saFilter.push(v.field + " eq " + v.value);
          } else {
            saFilter.push(v.field + " eq '" + v.value + "'");
          }
        } else {
          saFilter.push(v.field + " eq '" + v.value + "'");
        }
      } else {
        oFilters.push(new sap.ui.model.Filter(v.field, "EQ", v.value));
      }
    });

    // Ajax Call oData
    if (oFilterSearch) {
      $.each(that.getFilter(), function (i, v) {
        if (that.getAjaxCall() !== undefined && that.getAjaxCall()) {
          saFilter.push(v + " eq '" + oFilterValue + "'");
        }
      });
    }
    sFilter += saFilter.join(" and ");

    let sEntity = this.getDataSource() === undefined ? "/" + that.getEntity() + "Set" : "/" + that.getEntity();
    if (that.getBusyIndicator() !== undefined) {
      that.getParent().byId(that.getBusyIndicator()).setBusy(true);
    }
    let sURL = that.getModel(this.getDataSource()).sServiceUrl + that.getEntity() + sFilter;
    if (oFilterValue !== undefined && oFilterValue !== "") {
      sURL += "&$search=" + oFilterValue;
    }
    if (that.getAjaxCall() !== undefined && that.getAjaxCall()) {
      var aData = jQuery.ajax({
        type: "GET",
        contentType: "application/json",
        url: sURL,
        async: false,
        success: function (odata, textStatus, jqXHR) {
          console.log(odata);
          // oSearchHelpDialog.open();
          // // then set model & bind Aggregation
          // oSearchHelpDialog.bindAggregation("items", "/results", that._getColumnTemplates());
          // oSearchHelpDialog.setModel(new sap.ui.model.json.JSONModel({
          // 	results: odata.value
          // }));
          // that.getParent().byId(that.getBusyIndicator()).setBusy(false);

          oSearchHelpDialog.setModel(
            new sap.ui.model.json.JSONModel({
              results: odata.value,
            })
          );
          let jColumn = new sap.ui.model.json.JSONModel({
            cols: that._getColumnTemplates(),
          });
          oSearchHelpDialog.getTableAsync().then(
            function (oTable) {
              oTable.setModel(
                new sap.ui.model.json.JSONModel({
                  results: odata.value,
                })
              );
              oTable.setModel(jColumn, "columns");
              if (oTable.bindRows) {
                oTable.bindAggregation("rows", "/results");
              }
              if (oTable.bindItems) {
                oTable.bindAggregation("items", "/results", function () {
                  return new ColumnListItem({
                    cells: aCols.map(function (column) {
                      return new Label({
                        width: "11rem",
                        text: "{" + column.template + "}",
                      });
                    }),
                  });
                });
              }
              oSearchHelpDialog.update();
            }.bind(this)
          );

          if (that.getBusyIndicator() !== undefined) {
            that.getParent().byId(that.getBusyIndicator()).setBusy(false);
          }
          oSearchHelpDialog.open();
        },
        error: function (odata) {
          console.log(odata);
          if (that.getBusyIndicator() !== undefined) {
            that.getParent().byId(that.getBusyIndicator()).setBusy(false);
          }
        },
      });
    } else {
      that.getModel(that.getModelPath()).read(sEntity, {
        filters: oFilters,
        urlParameters: {
          $top: "250",
          search: oFilterValue !== undefined ? oFilterValue : "",
        },
        success: function (odata) {
          console.log(odata);
          // then set model & bind Aggregation
          oSearchHelpDialog.getTable().setModel(new sap.ui.model.json.JSONModel(odata));
          let jColumn = new sap.ui.model.json.JSONModel({
            cols: that._getColumnTemplates(),
          });
          oSearchHelpDialog.getTableAsync().then(
            function (oTable) {
              oTable.setModel(new sap.ui.model.json.JSONModel(odata));
              oTable.setModel(jColumn, "columns");
              if (oTable.bindRows) {
                oTable.bindAggregation("rows", "/results");
              }
              if (oTable.bindItems) {
                oTable.bindAggregation("items", "/results", function () {
                  return new ColumnListItem({
                    cells: aCols.map(function (column) {
                      return new Label({
                        width: "11rem",
                        text: "{" + column.template + "}",
                      });
                    }),
                  });
                });
              }
              oSearchHelpDialog.update();
            }.bind(this)
          );

          if (that.getBusyIndicator() !== undefined) {
            that.getParent().byId(that.getBusyIndicator()).setBusy(false);
          }
          oSearchHelpDialog.open();
        },
        error: function (odata) {
          console.log(odata);
          if (that.getBusyIndicator() !== undefined) {
            that.getParent().byId(that.getBusyIndicator()).setBusy(false);
          }
        },
      });
    }
  };

  return valueHelp;
});
