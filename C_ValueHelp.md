Code in Controller

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
