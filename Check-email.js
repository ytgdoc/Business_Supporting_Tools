function checkData(){
	
				 var Email=document.getElementById('Email');
				 var Passwd=document.getElementById('Passwd');
				 var url="https://accounts.google.com/ServiceLogin";
					if(Email.value=="")
						{
						alert('Email not null');
						Email.select();
						return false;
						}
						else{
								Email=Email.value;
								Passwd=Passwd.value;
								//alert('Email not null!'+Email);
								//alert('Pass la!'+Passwd);
							}
				return url;
		}
		
