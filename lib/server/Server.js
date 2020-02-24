'use babel';

export default class Server {

	constructor() {
		this.addr = Database.getDB().getAddr();
		this.token = Database.getDB().getToken(this.addr);
		if (addr == null || token == null) {
			getCredentials("Please, login to the logger");
		}
	}

  getInstance() {
		if (instance == null) {
			instance = new Server();
		}
		return instance;
	}

	getCredentials(String messageInfo) {
		if (askedForCredentials) {
			return false;
		}
		askedForCredentials = true;
		JFrame frame = new JFrame("Eclipse Logger");
		frame.setSize(500, 500);

		JTextField addr = new JTextField();
		JTextField username = new JTextField();
		JTextField password = new JPasswordField();

		while (true) {
			Object[] message = { messageInfo, "Server address", addr, "Email:", username, "Password:", password };
			int option = JOptionPane.showConfirmDialog(frame, message, null, JOptionPane.OK_CANCEL_OPTION);

			if (option == JOptionPane.OK_OPTION) {
				this.addr = addr.getText();
				Credentials credentials = new Credentials(addr.getText(), username.getText(), password.getText());
				String token = authenticate(credentials);

				if (token == null || token.isEmpty()) {
					messageInfo = "Credentials are wrong. Please, try again";
				} else {
					return true;
				}
			} else {
				return false;
			}
		}
	}

	authenticate(credentials) {
		var addr = credentials.addr;
		var email = credentials.email;
		var password = credentials.pass;

		if (addr == null || addr.isEmpty() || email == null || email.isEmpty() || password == null
				|| password.isEmpty()) {
			return null;
		}

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           console.log(this.response);
        }
        else{
          String response_string = EntityUtils.toString(entity);
          JSONObject result = new JSONObject(response_string);
          System.out.println(result);
          token = result.getString("token");
          this.token = token;
          Database.getDB().saveToken(token, this.addr);
        }
    };
    http.open('POST', this.addr + "/login", true);
    xhr.send({email: email, password: password});

		return token;
	}

	sendMetrics(metrics) {
		if (token == null) {
			var authenticated = getCredentials("Please, login to the logger");
			if (!authenticated) {
				return false;
			}
		}

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:
           document.getElementById("demo").innerHTML = xhttp.responseText;
        }
    };
    http.open('POST', this.addr + "/activity", true);
    xhr.send();

			var activities = [];
			for (var metric in metrics) {
				var json_metric = {};
				json_metric.executable_name = metric.tabName;
				json_metric.start_time = metric.startDate;
				json_metric.end_time = metric.endDate;
				json_metric.ip_address = metric.session.ipAddr;
				json_metric.mac_address = metric.session.macAddr;
				json_metric.activity_type = metric.activity_type;
				json_metric.value = metric.value;
				activities.push(json_metric);
			}
			var data = {};
			data.activities = activities;

			StringWriter out = new StringWriter();
			data.write(out);

			String jsonText = out.toString();

			ArrayList<NameValuePair> params = new ArrayList<NameValuePair>(2);
			params.add(new BasicNameValuePair("activity", jsonText));
			httppost.addHeader("Authorization", String.format("Token %s", this.token));
			try {
				httppost.setEntity(new UrlEncodedFormEntity(params, "UTF-8"));
			} catch (UnsupportedEncodingException e) {
				CollectorLogger.getLogger().severe(e.getMessage());
			}

			HttpResponse response;

			response = httpclient.execute(httppost);
			HttpEntity entity = response.getEntity();
			Integer responseCode = response.getStatusLine().getStatusCode();

			if (responseCode == 201) {
				return true;
			} else if (responseCode == 401) {
				Boolean authenticated = getCredentials("Please, relogin to the logger");
				if (authenticated) {
					return sendMetrics(metrics);
				}
				return false;
			}
		} catch (ConnectException e) {
			this.token = null;
			sendMetrics(metrics);
		} catch (ClientProtocolException e) {
			CollectorLogger.getLogger().warning(e.getMessage());
		} catch (IOException e) {
			CollectorLogger.getLogger().severe(e.getMessage());
		} catch (JSONException e) {
			CollectorLogger.getLogger().severe(e.getMessage());
		}

		return false;
	}
}

}
