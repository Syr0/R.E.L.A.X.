import {App, MarkdownView, Notice, Plugin, PluginSettingTab, Setting, TFile} from 'obsidian';

interface RegexGroup {
	isActive: boolean;
	groupName: string;
	regexes: Array<{ isActive: boolean, key: string, regex: string }>;
	isCollapsed?: boolean;
}
interface RelaxPluginSettings {
	regexGroups: Array<RegexGroup>;
	regexPairs: Array<{ isActive: boolean, key: string, regex: string }>;
	ignoreLinks?: boolean;
	ignoreURLs?: boolean;
	defangURLs?: boolean;
	ignoreCodeBlocks?: boolean;
	blacklist: string[];
}

var DEFAULT_SETTINGS = {
	regexPairs: [],
	regexGroups: [
		{
			isActive: true,
			groupName: "Default RegEx",
			regexes: [
				{
					"isActive": true,
					"key": "eMail",
					"regex": "([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,})"
				},
				{
					"isActive": true,
					"key": "Domains",
					"regex": "\\b([a-zA-Z0-9\\-\\.]+\\.(?:com|org|net|mil|edu|COM|ORG|NET|MIL|EDU))"
				},
		        {
		          "isActive": false,
		          "key": "Greedy Domains",
		          "regex": "\\b([a-zA-Z0-9\\-\\.]+\\.(?:17487|aaa|aarp|abarth|abb|abbott|abbvie|abc|abogado|abudhabi|academy|accenture|accountant|accountants|aco|active|actor|ads|adult|aeg|aero|aetna|afl|africa|agakhan|agency|aig|aigo|airbus|airforce|airtel|akdn|alfaromeo|alibaba|alipay|allfinanz|allstate|ally|alsace|alstom|amazon|americanexpress|amex|amica|amsterdam|analytics|android|any|anz|aol|apartments|app|apple|aquarelle|arab|aramco|archi|army|arpa|art|arte|asia|associates|attorney|auction|audi|audible|audio|auspost|author|auto|autos|aws|axa|azure|baby|baidu|bananarepublic|band|bank|bar|barcelona|barclaycard|barclays|barefoot|bargains|baseball|basketball|bauhaus|bayern|bazar|bbc|bbs|bbt|bbva|bcg|bcn|beauty|beer|bentley|berlin|best|bestbuy|bet|bharti|bible|bid|bike|bing|bingo|bio|bio:|bit|biz|black|blackfriday|blanco|blockbuster|blog|bloomberg|blue|bms|bmw|bnl|bnpparibas|boehringer|bom|bond|boo|book|booking|boots|bosch|bostik|boston|bot|boutique|box|br|bradesco|brand|bridgestone|broadway|broker|brother|brussels|br|bugatti|build|builders|business|buy|buzz|bzh|ca|cab|cafe|cal|call|calvinklein|cam|camera|camp|cancerresearch|canon|capetown|capital|capitalone|car|caravan|cards|care|career|careers|cars|cartier|casa|case|cash|casino|cat|catering|catholic|cba|cbn|cbre|cbs|center|ceo|cern|cfa|cfd|chan|chanel|channel|charity|chase|chat|cheap|chintai|christmas|chrome|chrysler|church|cipriani|circle|cisco|citadel|citi|citic|city|claims|cleaning|click|clinic|clinique|clothing|cloud|club|clubmed|coach|codes|coffee|coin|college|cologne|comcast|commbank|community|company|compare|computer|co|condos|construction|consulting|contact|contractors|cooking|cool|coop|corp|corsica|country|coupon|coupons|courses|cpa|credit|creditcard|creditunion|cricket|crown|crs|cruise|cruises|crypto|csc|cuisinella|cyb|cymru|cyou|dabur|dad|dance|data|date|dating|datsun|day|deal|dealer|deals|degree|delivery|dell|deloitte|delta|democrat|dental|dentist|desi|design|dev|dhl|diamonds|diet|digital|direct|directory|discount|discover|dish|diy|dnp|docs|doctor|dodge|dog|doha|domains|dot|download|drive|dubai|dunlop|dupont|durban|dvag|dyn|earth|eat|eco|edeka|edu|education|email|emc|emerck|energy|engineer|engineering|enterprises|entertainment|epost|epson|equipment|ericsson|erni|esq|estate|esurance|eth|etisalat|eu|eurovision|eus|events|everbank|example|exchange|expert|exposed|express|extraspace|fage|fail|fairwinds|faith|family|fan|fans|farm|farmers|fashion|fast|fedex|feedback|ferrari|ferrero|fiat|fidelity|film|final|finance|financial|fire|firestone|firmdale|fish|fishing|fit|fitness|flickr|flights|flir|florist|flowers|flsmidth|fly|foo|food|foodnetwork|football|ford|forex|forsale|forum|foundation|fox|free|fresenius|frl|frogans|frontdoor|frontier|fujitsu|fujixerox|fun|fund|fur|furniture|futbol|fyi|gal|gallery|gallo|gallup|game|games|gap|garden|gay|gbiz|gdn|gea|geek|gent|genting|gift|gifts|gives|giving|glass|gle|global|globo|gmail|gmbh|gmo|gmx|godaddy|gold|goldpoint|golf|goodyear|goog|google|gop|gopher|gov|grainger|graphics|gratis|green|gripe|grocery|group|guardian|gucci|guide|guitars|guru|hair|hamburg|hangout|haus|hbo|hdfc|hdfcbank|health|healthcare|help|helsinki|here|hermes|hiphop|hisamitsu|hitachi|hiv|hkt|hockey|holdings|holiday|home|homegoods|homes|homesense|honda|honeywell|horse|hospital|host|hosting|hot|hoteles|hotels|hotmail|house|how|hsbc|hughes|hyatt|hyundai|ibm|ice|icu|identity|ieee|ifm|ikano|imdb|immo|immobilien|in|inc|industries|indy|infiniti|info|ing|ink|institute|insurance|insure|int|intel|internal|international|intranet|intuit|invalid|investments|ipiranga|irish|iselect|ist|istanbul|itau|itv|iv|iveco|jaguar|java|jcb|jcp|jeep|jetzt|jewelry|jio|jobs|joburg|joy|jp|jpmorgan|juegos|juniper|kaufen|kddi|kerryhotels|kerrylogistics|kerryproperties|kfh|kia|kim|kinder|kindle|kitchen|kiwi|ko|koeln|komatsu|kosher|kpmg|kpn|kr|krd|kred|ku|kuokgroup|kyoto|lacaixa|ladbrokes|lamborghini|lan|lancaster|lancia|lancome|land|landrover|lanxess|las|lasalle|lat|latrobe|law|lawyer|lds|lease|leclerc|legal|lego|lexus|lgbt|liaison|lib|libre|lidl|life|lifeinsurance|lifestyle|lighting|like|lilly|limited|limo|lincoln|linde|link|lipsy|live|living|lixil|loan|loans|local|localhost|locker|locus|lol|london|lotte|lotto|love|lpl|lplfinancial|ltd|ltda|lundbeck|lupin|luxe|luxury|macys|madrid|maif|maison|makeup|man|management|mango|map|market|marketing|markets|marriott|maserati|mattel|mba|mckinsey|med|media|meet|melbourne|meme|memorial|men|menu|metlife|miami|microsoft|mil|mini|mint|mit|mitsubishi|mlb|mma|mobi|mobile|mobily|moda|moe|moi|mom|monash|money|monster|mormon|mortgage|moscow|moto|motorcycles|mov|movie|movistar|msd|mtn|mtr|museum|music|mutual|nadex|nagoya|name|nationwide|natura|navy|nba|nec|neo|net|netflix|network|neustar|new|newholland|news|nexus|nf|nfl|ngo|nhk|nico|nike|nikon|ninja|nissan|nissay|nokia|northwesternmutual|norton|now|nra|nrw|ntt|null|nyc|o|obi|observer|office|okinawa|omega|one|ong|onion|onl|online|ooo|open|oracle|orange|org|organic|origins|osaka|oss|otsuka|ovh|oz|page|panasonic|paris|parody|partners|parts|party|passagens|pay|pccw|pet|pfizer|pharmacy|philips|phone|photo|photography|photos|physio|piaget|pics|pictet|pictures|pid|pin|ping|pink|pioneer|pirate|pizza|place|play|playstation|plumbing|plus|pohl|poker|politie|porn|post|praxi|press|prime|private|pro|prod|productions|prof|progressive|promo|properties|property|protection|pru|prudential|pub|pwc|qpon|quebec|quest|qvc|racing|radio|read|realestate|realtor|realty|recipes|red|redstone|rehab|reise|reisen|reit|reliance|ren|rent|rentals|repair|report|republican|rest|restaurant|review|reviews|rexroth|rich|ricoh|ril|rio|rip|rm|rmit|rocher|rocks|rodeo|rogers|room|rsvp|rugby|ruhr|run|rwe|ryukyu|saarland|safe|safety|sakura|sale|salon|samsung|sandvik|sandvikcoromant|sanofi|sap|sarl|save|saxo|sbi|sbs|sca|scb|schaeffler|schmidt|scholarships|school|schule|schwarz|science|scjohnson|scor|scot|search|seat|secure|security|seek|select|sener|services|ses|seven|sew|sex|sexy|sfr|shangrila|sharp|shaw|shell|shiksha|shoes|shop|shopping|shouji|show|showtime|shriram|silk|sina|singles|site|ski|skin|sky|skype|sling|smart|smile|sncf|soccer|social|softbank|software|sohu|solar|solutions|song|sony|soy|spa|space|spiegel|sport|spot|spreadbetting|srl|stada|staples|star|starhub|statebank|statefarm|statoil|stc|stcgroup|stockholm|storage|store|stream|studio|study|style|su|sucks|supplies|supply|support|surf|surgery|suzuki|swatch|swiftcover|swiss|sydney|symantec|systems|taipei|talk|taobao|target|tatamotors|tatar|tattoo|tax|taxi|tdk|te|team|tech|technology|tel|telecity|telefonica|temasek|tennis|test|teva|theater|theatre|ti|tickets|tienda|tiffany|tips|tires|tirol|tjx|today|tokyo|tools|top|toray|toshiba|total|tours|town|toyota|toys|trade|trading|training|travel|travelchannel|travelers|travelersinsurance|trust|tube|tui|tunes|tushu|tvs|ubs|uconnect|uk|unicom|university|uno|uol|ups|us|uu|vacations|vanguard|vegas|ventures|verisign|vermögensberater|vermögensberatung|versicherung|vet|viajes|video|vig|viking|villas|vin|vip|virgin|visa|vision|vista|vistaprint|vivo|vlaanderen|vodka|volkswagen|volvo|vote|voting|voto|voyage|vuelos|wales|walmart|walter|wang|wanggou|watch|watches|weather|weatherchannel|webcam|weber|website|wed|wedding|weibo|weir|whoswho|wien|wien:|wiki|williamhill|win|windows|wine|winners|wme|wolterskluwer|woodside|work|works|world|wow|wtc|wtf|xbox|xerox|xfinity|xihuan|xin|xlm|xxx|xyz|yachts|yahoo|yamaxun|yandex|yodobashi|yoga|yokohama|you|youtube|zappos|zara|zero|zil|zip|zippo|zone|zuerich|дети|католик|ком|москва|онлайн|орг|рус|сайт|קום|ابوظبي|اتصالات|ارامكو|بازار|بيتك|شبكة|عرب|كاثوليك|كوم|موبايلي|موقع|कॉम|नेट|भारत|संगठन|বাংলা|คอม|みんな|アマゾン|クラウド|グーグル|コム|ストア|セール|ファッション|ポイント|世界|中|中信|中文网|亚马逊|佛山|八卦|公司|公益|商城|商标|嘉里|嘉里大酒店|在线|大众汽车|工行|广东|慈善|我爱你|手机|政府|机构|淡马锡|移动|网址|网站|网络|联通|诺基亚|谷歌|购物|集团|電訊盈科|飞利浦|香格里拉|닷넷|닷컴|삼성))\\b"
		        },
				{
					"isActive": true,
					"key": "IPv4",
					"regex": "\\b((?:(?:(?!1?2?7\\.0\\.0\\.1)(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)))\\b"
				},
				{
					"isActive": true,
					"key": "GUID",
					"regex": "([A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12})"
				},
				{
					"isActive": true,
					"key": "SHA256",
					"regex": "\\b([a-fA-F0-9]{64})\\b"
				},
				{
					"isActive": true,
					"key": "JARM",
					"regex": "\\b([a-fA-F0-9]{62})\\b"
				},
				{
					"isActive": true,
					"key": "SHA1",
					"regex": "\\b([a-fA-F0-9]{40})\\b"
				},
				{
					"isActive": true,
					"key": "MD5",
					"regex": "\\b([a-fA-F0-9]{32})\\b"
				},
				{
					"isActive": true,
					"key": "Bitcoin",
					"regex": "\\b([13]{1}[a-km-zA-HJ-NP-Z1-9]{26,33}|bc1[a-z0-9]{39,59})\\b"
				},
				{
					"isActive": true,
					"key": "Date",
					"regex": "((?:0[1-9]|[12][0-9]|3[01])[\\\\\\/\\.-](?:0[1-9]|1[012])[\\\\\\/\\.-](?:19|20|)\\d\\d)"
				},
				{
					"isActive": true,
					"key": "Windows Usernames",
					"regex": "\\\\Users\\\\+(?!(?:Public|Administrator)\\\\)([^\\\\]+)\\\\"
				},
				{
					"isActive": true,
					"key": "Markdown \xB4",
					"regex": "(?:[\xB4](((?:(?!<br>|\\r|\\n)[^\xB4 ]){4,30}))[\xB4])"
				},
				{
					"isActive": true,
					"key": "Markdown '",
					"regex": "(?:['](((?:(?!<br>|\\r|\\n)[^' ]){4,30}))['])"
				},
				{
					"isActive": true,
					"key": "CVEs",
					"regex": "(CVE-(1999|2\\d{3})-(?!0{4})(0\\d{2}[0-9]|[1-9]\\d{3,}))"
				},
				{
					"isActive": true,
					"key": "MAC Address",
					"regex": "([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})"
				},
				{
					"isActive": true,
					"key": "Tor Onion Address",
					"regex": "\\b((?:https?:\\/\\/)?(?:www)?(\\S*?\\.onion)\\b)"
				},
				{
					"isActive": true,
					"key": "IPv6 Address",
					"regex": "((?:[0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(?:ffff(?::0{1,4}){0,1}:){0,1}(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])|(?:[0-9a-fA-F]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9]))"
				},
				{
					"isActive": true,
					"key": "SSDeep",
					"regex": "(\\d+:[a-z+/A-Z0-9]+:[a-z+/A-Z0-9]+,\\\"[^\\\"]+\\\")"
				},
				{
					"isActive": true,
					"key": "VT subitter",
					"regex": "([0-9a-f]{8} - (?:api|web))"
				},
				{
					"isActive": true,
					"key": "MAC Adresses",
					"regex": "((?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2}))"
				},
				{
					"isActive": true,
					"key": "Passport",
					"regex": "([A-PR-WY][1-9]\\d\\s?\\d{4}[1-9])"
				},
				{
					"isActive": true,
					"key": "Markdown \u2018",
					"regex": "(?:[\u2018](((?:(?!<br>|\\r|\\n)[^\u2018 ]){4,30}))[\u2018])"
				},
				{
					"isActive": true,
					"key": "Markdown \u2019",
					"regex": "(?:[\u2019](((?:(?!<br>|\\r|\\n)[^\u2019 ]){4,30}))[\u2019])"
				},
				{
					"isActive": true,
					"key": 'Markdown "',
					"regex": '(?:["\u201E\u2033\u201D](((?:(?!<br>|\\r|\\n)[^"\u2033\u201D ]){4,30}))["\u2033\u201D])'
				},
				{
					"isActive": true,
					"key": "Markdown _",
					"regex": "(?:[_](((?:(?!<br>|\\r|\\n)[^_ ]){4,30}))[_])"
				},
				{
					"isActive": true,
					"key": "Markdown \u2018\u2019",
					"regex": "(?:[\u2018](((?:(?!<br>|\\r|\\n)[^\u2019 ]){4,30}))[\u2019])"
				},
				{
					"isActive": true,
					"key": "Signal Frequencies",
					"regex": "(\\b[0-9]{1,4}(?:\\.\\d{1,4})?\\s?(Hz|kHz|MHz|GHz)\\b)"
				},
				{
					"isActive": true,
					"key": "BibTeX Entries",
					"regex": "@(article|book|inbook|conference|inproceedings){([^}]+)}"
				},
				{
					"isActive": true,
					"key": "GPS Coordinates",
					"regex": "\\b[+-]?[0-9]{1,2}\\.[0-9]+,\\s*[+-]?[0-9]{1,3}\\.[0-9]+\\b"
				},
				{
					"isActive": true,
					"key": "ISBN Numbers",
					"regex": "\\bISBN\\s?(?:-?13|-10)?:?\\s?[0-9-]{10,17}\\b"
				},
				{
					"isActive": true,
					"key": "Camera Settings",
					"regex": "\\bISO\\s?[0-9]+|f/[0-9.]+|1/[0-9]+\\s?sec\\b"
				},
				{
					"isActive": true,
					"key": "Historical Dates",
					"regex": "\\b(?:[0-9]{1,4} (AD|BC)|[0-9]{1,4}th century)\\b"
				},
				{
					"isActive": true,
					"key": "Processor Specs",
					"regex": "\\bIntel Core i[3579]-[0-9]{4}[HQGU]K?|AMD Ryzen [3579] [0-9]{4}X?\\b"
				},
				{
					"isActive": false,
					"key": "Base64 Strings",
					"regex": "([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?"
				},
				{
					"isActive": false,
					"key": "Script Language File",
					"regex": "([\\w]+\\.(?:py|js|java|cs|cpp|rb|go|php))[\\b]"
				},
				{
					"isActive": false,
					"key": "Chord Progressions",
					"regex": "\\b((?:C|Dm|Em|F|G|Am|Bdim)(?:\\s->\\s(?:C|Dm|Em|F|G|Am|Bdim))*)\\b"
				},
				{
					"isActive": false,
					"key": "Hex Colors",
					"regex": "#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})"
				},
				{
					"isActive": false,
					"key": "Chemical Elements",
					"regex": "\\b(?:H|He|Li|Be|B|C|N|O|F|Ne|Na|Mg|Al|Si|P|S|Cl|Ar|K|Ca)\\b"
				},
				{
					"isActive": false,
					"key": "Hashtags",
					"regex": "#[A-Za-z0-9_]+"
				},
				{
					"isActive": false,
					"key": "Academic Citations",
					"regex": "\\b\\([A-Za-z]+,\\s[0-9]{4}\\)\\b"
				},
				{
					"isActive": false,
					"key": "Temperature Readings",
					"regex": "\\b-?[0-9]+\\s?(\xB0C|\xB0F|K)\\b"
				}
			]
		}
	],
	ignoreLinks: true,
	ignoreCodeBlocks: true,
	defangURLs: true,
	ignoreURLs: false,
	blacklist: [
		"github.com",
		"127.0.0.1",
		"microsoft.com",
		"www.youtube.com",
		"youtube.com",
		"www.microsoft.com",
		"www.github.com",
		"medium.com",
		"www.medium.com",
		"white",
		"windows",
		"kaspersky.com",
		"gmail.com",
		"domain.com",
		"www.fireeye.com",
		"researchcenter.paloaltonetworks.com",
		"www.symantec.com",
		"www.virustotal.com",
		"www.trendmicro.com",
		"virustotal.com",
		"www.Sophos.com",
		"www.mcafee.com",
		"\\Users\\User\\",
		"twitter.com",
		"nytimes.com",
		"_НЕМЕЦКИЕ_",
		"www.FireEye.com",
		"fireeye.com",
		"info@fireeye.com",
		"alumni.ecnu.edu",
		"down.51cto.com",
		"www.djbh.net",
		"www.yingjiesheng.com",
		"www.recordedfuture.com",
		"zhidao.baidu.com",
		"mandiant.com",
		"info@mandiant.com",
		"126.com",
		"163.com",
		"hotmail.com",
		"qq.com",
		"sohu.com",
		"yahoo.com",
		"www.mandiant.com",
		"FireEye.com",
		"secureworks.com",
		"blog.trendmicro.com",
		"trendmicro.com",
		"www.slideshare.net",
		"www.pwc.com",
		"securelist.com",
		"www.eset.com",
		"asert.arbornetworks.com",
		"unit42.paloaltonetworks.com",
		"sert.arbornetworks.com",
		"log.apnic.net",
		"www.netscout.com",
		"research.nccgroup.com",
		"intelligence@kaspersky.com",
		"update.iaacstudio.com",
		"bleepingcomputer.com",
		"campuscodi@xmpp.is",
		"::",
		"_LOCAL_",
		"_CURRENT_",
		"intelreports@kaspersky.com",
		"www.welivesecurity.com",
		"attack.mitre.org",
		"www.clearskysec.com",
		"blog.talosintelligence.com",
		"itsec.eicp.net",
		"pastebin.com",
		"research.checkpoint.com",
		"www.proofpoint.com",
		"en.wikipedia.org",
		"::C",
		"docs.microsoft.com",
		"www.bleepingcomputer.com",
		"_process_",
		"blog.malwarebytes.com",
		"e::",
		"_file_",
		"0.0.0.0",
		"::F",
		"info@clearskysec.com",
		"mp.weixin.qq.com",
		"www.crowdstrike.com",
		"_EXECUTE_",
		"'Public'",
		"ti.qianxin.com",
		"_string_",
		"google.com",
		"_meteor_",
		"_name_",
		"d::",
		"onlinenic-enduser@onlinenic.com",
		"welivesecurity.com",
		"www.google.com",
		"www.cybereason.com",
		"icann.org",
		"_content_",
		"\\Users\\user\\",
		"www.facebook.com",
		"\"name\"",
		"securityintelligence.com",
		"www.secureworks.com",
		"_data_",
		"news.sophos.com",
		"Microsoft.NET",
		"www.threatgeek.com",
		"www.zdnet.com",
		"raw.githubusercontent.com",
		"www.fidelissecurity.com",
		"ti.360.net",
		"blogs.blackberry.com",
		"\"POST\"",
		"_FILE_",
		"cdn.discordapp.com",
		"pic.twitter.com",
		"msdn.microsoft.com",
		"::c",
		"krebsonsecurity.com",
		"symantec-enterprise-blogs.security.com",
		"_dropper_",
		"www.reuters.com",
		"BleepingComputer.com",
		"soft@hotmail.com",
		"ASP.NET",
		"8.8.8.8",
		"_DATA_",
		"www.wired.com",
		"proofpoint.com",
		"\"Mandiant\"",
		"\\Users\\admin\\",
		"_Trojan_",
		"reeye.com",
		"\"value\"",
		"thedfirreport.com",
		"threatpost.com",
		"'\"{0}\"'",
		"info@lifars.com",
		"LIFARS.com",
		"_from_",
		"au.com",
		"isc.sans.edu",
		"protonmail.com",
		"asec.ahnlab.com",
		"www.threatconnect.com",
		"www.dropbox.com",
		"\"true\"",
		"www.nytimes.com",
		"crowdstrike.com",
		"drive.google.com",
		"\"white\"",
		"\"WScript.Shell\"",
		"www.arbornetworks.com",
		"docs.google.com",
		"_DOMAIN_",
		"www.virusbulletin.com",
		"_creation/win_",
		"whois.arin.net",
		"_Backdoor_",
		"citizenlab.org",
		"www.fortinet.com",
		"Snort.org",
		"::A",
		"web.archive.org",
		"_sample_",
		"_proc_",
		"_hash_",
		"fortinet.com",
		"www.readability.com",
		"doi.org",
		"192.168.1.1",
		"_decrypt_",
		"blog.yoroi.com",
		"\"data\"",
		"F-Secure.com",
		"\"informational\"",
		"www.group-ib.com",
		"gcat.google.com",
		"www.linkedin.com",
		"contact@idcprivacy.com",
		"_COMMON_",
		"\"type\"",
		"_client_",
		"\"&bs&\"",
		"threatintel@eset.com",
		"blog.netlab.360.com",
		"\\Users\\<user>\\",
		"_part_",
		"pandasecurity.com",
		"technet.microsoft.com",
		"\\Users\\username\\",
		"www.morphisec.com",
		"'\\x00'",
		"avsvmcloud.com",
		"1.0.0.0",
		"_PROCESS_",
		"_ATTRIBUTE_",
		"www.bbc.com",
		"www.volexity.com",
		"::cb",
		"securingtomorrow.mcafee.com",
		"www.w3.org",
		"withheldforprivacy.com",
		"www.ptsecurity.com",
		"_FLAG_",
		"_read_",
		"talosintelligence.com",
		"_write_",
		"\\Users\\<username>\\",
		"_entry_",
		"_value_",
		"_TYPE_",
		"_user_",
		"a::",
		"facebook.com",
		"\"false\"",
		"\"cmd.exe\"",
		"_config_",
		"1.1.1.1",
		"_init_",
		"_CLASSES_",
		"www.f-secure.com",
		"www.washingtonpost.com",
		"clearskysec.com",
		"info@cyberkov.com",
		"_module_",
		"_object_",
		"zscaler.com",
		"www.apple.com",
		"::E",
		"api.telegram.org",
		"www.cyberkov.com",
		"blogs.microsoft.com",
		"cybersecurity.att.com",
		"www.cisco.com",
		"api.ipify.org",
		"dragos.com",
		"www.freebuf.com",
		"www.kaspersky.com",
		"_server_",
		"blog.group-ib.com",
		"talos-external@cisco.com",
		"_DEVICE_",
		"_Hunting_",
		"schemas.microsoft.com",
		"www.intezer.com",
		"objective-see.com",
		"1.3.6.1",
		"group-ib.com",
		"\"UTF-8\"",
		"_Donut_",
		"_QUERY_",
		"example.com",
		"link.linkipv6.com",
		"CyWatch@fbi.gov",
		"www.paloaltonetworks.com",
		"ddns.net",
		"www.amnesty.org",
		"www.darkreading.com",
		"archive.org",
		"\"file\"",
		"sentinelone.com",
		"_payload_",
		"'value'",
		"ptsecurity.com",
		"_encrypted_",
		"_security_",
		"_with_",
		"æCheersÆ",
		"\"kernel32.dll\"",
		"blog.cyble.com",
		"_Win32_",
		"_type_",
		"symantec.com",
		"\"path\"",
		"\"Port\"",
		"_command_",
		"gist.github.com",
		"wikileaks.org",
		"thehackernews.com",
		"_WITH_",
		"www.bitly.com",
		"dawn.pakgov.org",
		"_next_",
		"bitly.com",
		"\"UTF-16LE\"",
		"contagiodump.blogspot.com",
		"www.exploit-db.com",
		"\"config\"",
		"intezer.com",
		"cybereason.com",
		"support.microsoft.com",
		"_random_",
		"_block_",
		"\"Microsoft\"",
		"sites.google.com",
		"_FILES_",
		"_SYSTEM_",
		"_operand_",
		"www.blackhat.com",
		"www.anomali.com",
		"\"Scripting.FileSystemObject\"",
		"_NOTIFY_",
		"\"process\"",
		"\"Jitter\"",
		"blog.avast.com",
		"\"server\"",
		"_Loader_",
		"\"event\"",
		"\"Platinum\"",
		"schemas.xmlsoap.org",
		"www.theguardian.com",
		"blog.morphisec.com",
		"tutanota.com",
		"_Report_",
		"_line_",
		"_THREAD_",
		"_DIRECTORY_",
		"www.sophos.com",
		"_target_",
		"mail.com",
		"\\Users\\Admin\\",
		"s.certfa.com",
		"_2-gram_",
		"\"tok-go\"",
		"_sequence_",
		"api.faceit.com",
		"www.securityweek.com",
		"www.sans.org",
		"www.accenture.com",
		"www.icann.org",
		"_Shell_",
		"labs.sentinelone.com",
		"\"powershell.exe\"",
		"www.secpulse.com",
		"_executable_",
		"WWW.LOGRHYTHM.COM",
		"\"ES_EVENT_",
		"cylera.com",
		"cdnlist.net",
		"id-ransomware.blogspot.com",
		"\"NCSC\"",
		"exploitreversing.com",
		"www.wsj.com",
		"community.riskiq.com",
		"blog.certfa.com",
		"judystevenson.info",
		"boozallen.com",
		"\"hidden_cobra\"",
		"_header_",
		"_func_",
		"WWW.VIRUSBULLETIN.COM",
		"www.torproject.org",
		"\"Start\"",
		"_FONT_",
		"SecPulse.COM",
		"tinyurl.com",
		"\"password\"",
		"apple.com",
		"blogs.technet.com",
		"www.idcprivacy.com",
		"_local_",
		"arstechnica.com",
		"www.bitdefender.com",
		"_public_",
		"\"sha1\"",
		"_PHONE_",
		"marcoramilli.com",
		"_update_",
		"trustwave.com",
		"i.imgur.com",
		"customerportal.solarwinds.com",
		"www.zscaler.com",
		"_path_",
		"_start_",
		"\"time\"",
		"\"C:\\Windows\\System32\\cmd.exe\"",
		"\"root\"",
		"_host_",
		"æalyac.org",
		"taskmgr.servehttp.com",
		"_stomp_",
		"\"Polling\"",
		"www.bloomberg.com",
		"www.akamai.com",
		"threatrecon.nshc.net",
		"_service_",
		"msrc.microsoft.com",
		"learn.microsoft.com",
		"\"base64\"",
		"_REQUEST_",
		"private.directinvesting.com",
		"\\Users\\USER\\",
		"_HOMEUNIX_",
		"recordedfuture.com",
		"malware-traffic-analysis.net",
		"ip-api.com",
		"_VERSION_",
		"blog.eset.com",
		"\"sha256\"",
		"_REL32_",
		"www.forbes.com",
		"nakedsecurity.sophos.com",
		"_CREATE_",
		"\"username\"",
		"_libc_",
		"assadcrimes.info",
		"stemtopx.com",
		"intel471.com",
		"vblocalhost.com",
		"\"open\"",
		"_READ_",
		"service.clickaway.com",
		"www.LIFARS.com",
		"team-cymru.com",
		"_table_",
		"_SECTION_",
		"::Dec",
		"\"__main_",
		"_kernel32_",
		"_GLOB_",
		"www.threatexpert.com",
		"media.kasperskycontenthub.com",
		"naver.com",
		"zdnet.com",
		"\"Wscript.Shell\"",
		"iplogger.org",
		"_stack_",
		"_STATUS_",
		"cderlearn.com",
		"_creation/proc_",
		"'bytes'",
		"threatvector.cylance.com",
		"\"port\"",
		"\"REG_DWORD\"",
		"techcommunity.microsoft.com",
		"\"\\x00\"",
		"www.km153.com",
		"_files_",
		"www.sentinelone.com",
		"ww.recordedfuture.com",
		"_ENTRY_",
		"_call_",
		"_current_",
		"::a",
		"æ",
		"_list_",
		"reyweb.com",
		"\"center\"",
		"_EXTERNAL_",
		"'__main_",
		"_Webshell_",
		"play.google.com",
		"'utf-8'",
		"www.godaddy.com",
		"\"submit\"",
		"info@FireEye.com",
		"_inthe_",
		"threatconnect.com",
		"intrusiontruth.wordpress.com",
		"\\Users\\Username\\",
		"mcafee.com",
		"_main_",
		"E::",
		"de.com",
		"ætypeÆ",
		"'false'",
		"_susp_",
		"_START_",
		"_DISK_",
		"_apt38_",
		"_check_",
		"www.mediafire.com",
		"info@circl.lu",
		"wordkeyvpload.net",
		"_APT1_",
		"_packet_",
		"_buffer_",
		"_IMAGE_",
		"www.blackberry.com",
		"plus.google.com",
		"_code_",
		"\"REG_SZ\"",
		"securityscorecard.com",
		"\"True\"",
		"\"start\"",
		"_internal_",
		"photobucket.com",
		"\"Name\"",
		"192.168.0.1",
		"pwc.blogs.com",
		"labs.bitdefender.com",
		"_HIGHNOON_",
		"_Ransomware_",
		"_INFO_",
		"æpath.alyac.org",
		"com.ga",
		"\"utf-8\"",
		"_cobra_",
		"VB.NET",
		"_frame_",
		"_Generic_",
		"_Dropper_",
		"rdap.arin.net",
		"submit@malware.us-cert.gov",
		"www.csoonline.com",
		"www.amazon.com",
		"\"Content-Type\"",
		"_method_",
		"\"arguments\"",
		"redcanary.com",
		"\\Users\\*\\",
		"www.langner.com",
		"_pass_",
		"EFF.ORG",
		"www.securityscorecard.com",
		"info.publicintelligence.net",
		"documents.trendmicro.com",
		"\"user\"",
		"www.bing.com",
		"æTeamSpyÆ",
		"gitlab.com",
		"\"Type\"",
		"_/\\/\\_",
		"\"Base\"",
		"process.com",
		"255.255.255.0",
		"_memory_",
		"_2020_",
		"_encoded_",
		"otx.alienvault.com",
		"_system_",
		"phdays.com",
		"\"DistinguishedName\"",
		"\"ScopeOfSearch\"",
		"\"SearchFilter\"",
		"\"member=*\"",
		"www.apache.org",
		"_resolve_",
		"\"client\"",
		"_version_",
		"\"text\"",
		"_OPTION_",
		"report@cisa.gov",
		"\"system\"",
		"\"hostname\"",
		"10.0.0.1",
		"Cybersecurity_Requests@nsa.gov",
		"\\Users\\\\%username%\\",
		"topsec2014.com",
		"_section_",
		"greensky27.vicp.net",
		"_stub_",
		"www.carbonblack.com",
		"\\Users\\%username%\\",
		"_time_",
		"GODADDY.COM",
		"www.cyberark.com",
		"sharingmymedia.com",
		"we11point.com",
		"\\Users\\IEUser\\",
		"coldsealus.fatcow.com",
		"www.researchbundle.com",
		"wilcarobbe.com",
		"xml.ssdsandbox.net",
		"_size_",
		"_exploit_",
		"www.ahnlab.com",
		"\"White\"",
		"_return_",
		"\".exe\"",
		"www.exatrack.com",
		"_SystemCall_",
		"\"hidden\"",
		"bitbucket.org",
		"com.net",
		"_nagy_",
		"0v2x.blogspot.com",
		"\"NO_CHANGE\"",
		"_Threat_",
		"_access_",
		"_EXPORT_",
		"_proxy_",
		"www.cyberscoop.com",
		"www.yahoo.com",
		"www.namecheap.com",
		"blog.checkpoint.com",
		"_win32_",
		"::f",
		"::e",
		"aol.com",
		"_BOOT_",
		"_ACCESS_",
		"_Fidelis_",
		"_delegate_",
		"_ENGLISH_",
		"tr.com",
		"'udbcgiut.dat'",
		"papagujjiiiiii.blogspot.com",
		"9ke6n.blogspot.com",
		"joexpediagroup.com",
		"_NtElevation_",
		"_last_",
		"www.cve.mitre.org",
		"_CONTROL_",
		"_EXPAND_",
		"www.bankinfosecurity.com",
		"www.contextis.com",
		"WeLiveSecurity.com",
		"blog.reversinglabs.com",
		"\"test\"",
		"_STACK_",
		"_byte_",
		"blog.fox-it.com",
		"bannetwork.org",
	    "Mitre.org",
	    "LinkedIn.com",
	    "RiskIQ.com",
	    "MEI.edu",
	    "Twitter.com",
	    "AtlanticCouncil.org",
	    "Certfa.com",
	    "Proofpoint.com",
	    "FB.com",
	    "Yubico.com",
	    "Mandiant.com",
	    "outlook.com"
	]
};

class RelaxSettingTab extends PluginSettingTab {
	plugin: RelaxPlugin;
	keyValueContainer: HTMLDivElement;
	saveButton: HTMLButtonElement;
	isHighlighted = false;
	dragElement = null;
	currentIndex = null;
	newIndex = null;
	startY = 0;
	startTop = 0;
	initialOffsetY = 0;
	private settingsInitialized = false;


	constructor(app: App, plugin: RelaxPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.onDragEnd = this.onDragEnd.bind(this);
		this.onDragMove = this.onDragMove.bind(this);
		this.makeDraggable = this.makeDraggable.bind(this);

		this.updateRegexOrderFromDOM = () => {
			const regexGroups = [];
			this.keyValueContainer.querySelectorAll(".regex-group-container").forEach(groupContainer => {
				const groupNameElement = groupContainer.querySelector(".regex-group-name");
				const activeCheckboxInput = groupContainer.querySelector("input[type='checkbox']");
				const groupName = groupNameElement ? groupNameElement.textContent : "";
				const isActive = activeCheckboxInput ? activeCheckboxInput.checked : false;

				const regexes = Array.from(groupContainer.querySelectorAll(".regex-group-content .flex-row")).map(row => {
					const keyInput = row.querySelector("input[placeholder='Description-Key']");
					const valueInput = row.querySelector("input[placeholder='Regexp']");
					const regexActiveCheckbox = row.querySelector("input[type='checkbox']");
					return {
						isActive: regexActiveCheckbox ? regexActiveCheckbox.checked : false,
						key: keyInput ? keyInput.value : "",
						regex: valueInput ? valueInput.value : ""
					};
				});

				const isCollapsed = groupContainer.querySelector('.regex-group-content').style.display === "none";
				regexGroups.push({isActive, groupName, regexes, isCollapsed});
			});

			if (this.plugin && this.plugin.settings) {
				this.plugin.settings.regexGroups = regexGroups;
			} else {
				console.error("Plugin or settings not available");
			}
			const regexPairs = Array.from(this.keyValueContainer.querySelectorAll(".standalone-regex-row")).map(row => {
				const keyInput = row.querySelector("input[placeholder='Description-Key']");
				const valueInput = row.querySelector("input[placeholder='Regexp']");
				const regexActiveCheckbox = row.querySelector("input[type='checkbox']");
				return {
					isActive: regexActiveCheckbox ? regexActiveCheckbox.checked : false,
					key: keyInput ? keyInput.value : "",
					regex: valueInput ? valueInput.value : ""
				};
			});

			this.plugin.settings.regexPairs = regexPairs;
			this.plugin.saveSettings();
		};


		this.saveChanges = () => {
			this.updateRegexOrderFromDOM();
			this.plugin.saveSettings();
			const closeButton = document.querySelector(".modal-close-button");
			if (closeButton) {
				closeButton.click();
			}
			this.setHighlighted(false);
		};
	}

	makeDraggable(element, dragHandle) {
		if (!dragHandle) {
			console.error("Drag handle not found!", element.innerHTML);
			return;
		}

		dragHandle.addEventListener("mousedown", (e) => {
			e.preventDefault();
			e.stopPropagation();

			this.dragElement = element;
			this.dragElement.classList.add("dragging");

			this.placeholder = document.createElement('div');
			this.placeholder.className = 'placeholder';
			this.placeholder.style.position = 'relative';
			this.placeholder.style.height = `${element.offsetHeight}px`;
			this.placeholder.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
			element.parentNode.insertBefore(this.placeholder, element);

			this.dragElement.style.visibility = 'hidden';
			this.dragElement.style.border = 'none';

			const clone = this.dragElement.cloneNode(true);
			clone.style.position = 'absolute';
			clone.style.top = '0';
			clone.style.left = '0';
			clone.style.width = '100%';
			clone.style.height = '100%';
			clone.style.visibility = 'visible';
			clone.style.pointerEvents = 'none';
			clone.style.zIndex = '999';
			this.placeholder.appendChild(clone);

			const frame = document.createElement('div');
			frame.style.position = 'absolute';
			frame.style.top = '0';
			frame.style.left = '0';
			frame.style.width = '100%';
			frame.style.height = '100%';
			frame.style.border = '2px dashed var(--interactive-accent)';
			frame.style.boxSizing = 'border-box';
			frame.style.zIndex = '1000';
			this.placeholder.appendChild(frame);

			document.addEventListener("mousemove", this.onDragMove);
			document.addEventListener("mouseup", this.onDragEnd);
		});
	}
	findClosestGroupOrStandaloneArea(yPosition) {
		let closest = null;
		let closestDistance = Infinity;

		const allContainers = this.keyValueContainer.querySelectorAll('.regex-group-container, .standalone-regex-row');

		allContainers.forEach(container => {
			const rect = container.getBoundingClientRect();
			const containerMidpoint = window.scrollY + rect.top + rect.height / 2;
			const distance = Math.abs(yPosition - containerMidpoint);

			if (distance < closestDistance) {
				closest = container;
				closestDistance = distance;
			}
		});

		return closest;
	}

	findSourceGroupIndex(dragElement) {
		const groupContainer = dragElement.closest('.regex-group-container');
		if (!groupContainer) return -1;

		const groupName = groupContainer.querySelector(".regex-group-name").textContent.trim();
		return this.plugin.settings.regexGroups.findIndex(group => group.groupName === groupName);
	}

	adjustPlaceholderPosition(targetGroup) {
		if (!this.dragElement || !this.placeholder) return;
		if (targetGroup.classList.contains('regex-group-container') || targetGroup.classList.contains('standalone-regex-row')) {
			const parent = targetGroup.parentNode;

			if (parent && (parent === this.placeholder.parentNode)) {
				parent.insertBefore(this.placeholder, targetGroup);
			}
		}
	}

	onDragMove(e) {
		if (!this.dragElement) return;

		const parent = this.dragElement.parentElement;
		const scrollTop = parent.scrollTop;
		const mouseY = e.clientY + scrollTop;

		let closest = null;
		let closestDistance = Infinity;

		[...parent.children].forEach((child) => {
			if (child !== this.dragElement && child !== this.placeholder) {
				const rect = child.getBoundingClientRect();
				const childMidpoint = rect.top + scrollTop + rect.height / 2;
				const distance = Math.abs(mouseY - childMidpoint);

				if (distance < closestDistance) {
					closest = child;
					closestDistance = distance;
				}
			}
		});

		if (this.placeholder) {
			const clone = this.placeholder.querySelector('.clone-class');
			if (clone) {
				clone.style.transform = `translateY(${e.clientY - this.startY}px)`;
			}
		}

		if (closest) {
			const rect = closest.getBoundingClientRect();
			const childMidpoint = rect.top + scrollTop + rect.height / 2;
			if (mouseY < childMidpoint) {
				parent.insertBefore(this.placeholder, closest);
			} else {
				parent.insertBefore(this.placeholder, closest.nextSibling);
			}
		}

		let targetGroup = this.findClosestGroupOrStandaloneArea(e.clientY);
		if (targetGroup) {
			if (targetGroup.classList.contains('regex-group-container')) {
				if (targetGroup) {
					this.adjustPlaceholderPosition(targetGroup);
				}
			}
		}
	}
	findRegexIndexInGroup(dragElement, sourceGroupIndex)
	{
		const group = this.plugin.settings.regexGroups[sourceGroupIndex];
		const regexKey = dragElement.querySelector("input[placeholder='Description-Key']").value;
		return group.regexes.findIndex(regex => regex.key === regexKey);
	}

	onDragEnd() {
		if (!this.dragElement || !this.placeholder)
			return;

		this.placeholder.parentNode.insertBefore(this.dragElement, this.placeholder);
		this.dragElement.style.visibility = "visible";
		this.placeholder.remove();
		this.dragElement.classList.remove("dragging");
		this.dragElement = null;
		this.placeholder = null;

		this.updateRegexOrderFromDOM();
		this.plugin.saveSettings();
	}


	findGroupIndex(groupElement) {
		if (!groupElement) return -1;
		const groupName = groupElement.querySelector(".regex-group-name").textContent.trim();
		return this.plugin.settings.regexGroups.findIndex(group => group.groupName === groupName);
	}

	findRegexPairIndex(draggedElement) {
		const key = draggedElement.querySelector("input[placeholder='Description-Key']").value;
		return this.plugin.settings.regexPairs.findIndex(pair => pair.key === key);
	}


	setHighlighted(highlight: boolean) {
		this.isHighlited = highlight;
		if (this.saveButton) {
			this.saveButton.disabled = !highlight;
			if (highlight) {
				this.saveButton.classList.add("is-highlight");
			} else {
				this.saveButton.classList.remove("is-highlight");
			}
		}
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();
		this.keyValueContainer = containerEl.createEl("div");
		this.keyValueContainer.classList.add("flex-column");

		this.createSettingsUI(containerEl);

		const validateContent = (content) => {
			const regex = /\[\[(.+?)\]\]/g;
			return !regex.test(content);
		};

		const applyValidationStyle = (textarea) => {
			if (validateContent(textarea.value)) {
				textarea.classList.toggle("valid-content", validateContent(textarea.value));
			} else {
				textarea.classList.toggle("invalid-content", !validateContent(textarea.value));
			}
		};

		document.addEventListener("DOMContentLoaded", (event) => {
			const modalButton = document.querySelector("#openModalButton");

			modalButton.addEventListener("click", function () {
				const modal = document.querySelector(".modal");
				const textarea = modal.querySelector("textarea");

				applyValidationStyle(textarea);

				textarea.addEventListener("input", function () {
					applyValidationStyle(textarea);
				});
			});

			let draggedElement = null;
			let placeholder = null;

			const createPlaceholder = () => {
				const div = document.createElement('div');
				div.style.height = '2px';
				div.style.background = 'blue';
				div.style.margin = '5px 0';
				return div;
			};

			document.querySelectorAll('.draggable').forEach(elem => {
				elem.addEventListener('mousedown', function(e) {
					draggedElement = this;
					placeholder = createPlaceholder();
					draggedElement.parentNode.insertBefore(placeholder, draggedElement.nextSibling);
					draggedElement.style.opacity = '0.5';
					e.preventDefault();
				});

				document.addEventListener('mousemove', (e) => {
					if (!draggedElement) return;

					const rect = placeholder.getBoundingClientRect();
					const parent = placeholder.parentNode;
					parent.childNodes.forEach((child) => {
						if (child !== draggedElement && child !== placeholder) {
							const childRect = child.getBoundingClientRect();
							if (e.clientY > childRect.top && e.clientY < childRect.bottom) {
								if (e.clientY < (childRect.top + childRect.bottom) / 2) {
									parent.insertBefore(placeholder, child);
								} else {
									parent.insertBefore(placeholder, child.nextSibling);
								}
							}
						}
					});
				});

				document.addEventListener('mouseup', () => {
					if (draggedElement) {
						draggedElement.style.opacity = '1';
						placeholder.parentNode.insertBefore(draggedElement, placeholder);
						placeholder.parentNode.removeChild(placeholder);
						draggedElement = null;
						placeholder = null;
					}
				});
			});
		});

		const validateRegexInput = (input) => {
			let errorMsg = "";
			try {
				const reg = new RegExp(input.value);
				const groupCount = (input.value.match(/\((?!\?)/g) || []).length;
				if (groupCount > 1) {
					input.classList.add("invalid-border");
					errorMsg = "More than one group detected.";
				} else {
					input.classList.remove("invalid-border");
				}
			} catch (e) {
				input.classList.add("invalid-border");
				errorMsg = "Invalid regex.";
			}

			const errorElement = input.nextSibling;
			if (errorElement && errorElement.classList.contains("regex-error")) {
				errorElement.textContent = errorMsg;
			} else {
				const span = document.createElement("span");
				span.className = "regex-error";
				span.textContent = errorMsg;
				input.parentNode.insertBefore(span, input.nextSibling);
			}
		};

		const addRegexToGroup = (groupContent, regex) => {
			const row = groupContent.createEl("div", {cls: 'flex-row'});
			row.style.display = 'flex';
			row.style.alignItems = 'center';

			const dragHandle = row.createEl("span", {className: "drag-handle", text: "☰"});
			const activeCheckbox = row.createEl("input", {type: "checkbox", className: "active-checkbox"});
			activeCheckbox.checked = regex.isActive;

			const keyInput = row.createEl("input", {
				type: "text",
				className: "key-input-flex",
				value: regex.key,
				placeholder: "Description-Key"
			});

			const valueInput = row.createEl("input", {
				type: "text",
				className: "value-input-flex",
				value: regex.regex,
				placeholder: "Regexp"
			});
			valueInput.style.flexGrow = '1';

			const deleteButton = row.createEl("button", {text: "Delete", className: "delete-button"});

			deleteButton.addEventListener("click", () => {
				row.remove();
				this.updateRegexOrderFromDOM();
				this.plugin.saveSettings();
			});

			if (dragHandle) this.makeDraggable(row, dragHandle);
			keyInput.addEventListener("input", () => {
				this.setHighlighted(true);
			});

			valueInput.addEventListener("input", () => {
				validateRegexInput(valueInput);
				this.setHighlighted(true);
			});
		}

		const addGroupUI = (group, index) => {

			const groupContainer = this.keyValueContainer.createEl("div", { cls: 'regex-group-container group-container' });
			groupContainer.style.border = group.isActive ? "1px solid var(--interactive-accent)" : "1px solid #ccc";
			groupContainer.style.padding = "10px";
			groupContainer.style.marginBottom = "10px";

			const groupHeader = groupContainer.createEl("div", { cls: "regex-group-header" });

			const groupNameAndControls = groupHeader.createDiv({ cls: "group-name-and-controls" });

			const dragHandle = groupNameAndControls.createEl("span", { className: "drag-handle", text: "\u2630" });
			const collapseIcon = groupNameAndControls.createEl("span", { cls: 'collapse-icon' });
			collapseIcon.textContent = group.isCollapsed ? '►' : '▼';

			const groupActiveCheckbox = groupNameAndControls.createEl("input", { type: 'checkbox' });
			groupActiveCheckbox.checked = group.isActive;

			const groupNameEl = groupNameAndControls.createEl("span", { cls: "regex-group-name", text: group.groupName });
			groupNameEl.setAttribute("contenteditable", "true");

			const controlButtons = groupHeader.createDiv({ cls: "control-buttons" });

			const addRegexButton = controlButtons.createEl("button", { text: "Add Regex", className: "add-regex-button" });

			const deleteGroupButton = controlButtons.createEl("button", { text: "Delete Group", className: "delete-group-button" });

			groupActiveCheckbox.addEventListener("change", () => {
				group.isActive = groupActiveCheckbox.checked;
				groupContainer.style.border = group.isActive ? "1px solid var(--interactive-accent)" : "1px solid #ccc";
				this.setHighlighted(true);
			});

			const groupContent = groupContainer.createEl("div", { cls: 'regex-group-content' });
			groupContent.style.display = group.isCollapsed ? "none" : "block";


			addRegexButton.addEventListener("click", () => {
				group.regexes = Array.from(groupContainer.querySelectorAll(".regex-group-content .flex-row")).map(row => {
					const keyInput = row.querySelector("input[placeholder='Description-Key']");
					const valueInput = row.querySelector("input[placeholder='Regexp']");
					const regexActiveCheckbox = row.querySelector("input[type='checkbox']");
					return {
						isActive: regexActiveCheckbox ? regexActiveCheckbox.checked : false,
						key: keyInput ? keyInput.value : "",
						regex: valueInput ? valueInput.value : ""
					};
				});
				group.regexes.unshift({ isActive: true, key: "New Key", regex: "New Regex" });
				this.plugin.settings.regexGroups[index] = group;
				this.plugin.saveSettings();
				this.display();
			});

			deleteGroupButton.addEventListener("click", () => {
				this.plugin.settings.regexGroups.splice(index, 1);
				this.plugin.saveSettings();
				this.display();
			});

			collapseIcon.addEventListener("click", () => {
				group.isCollapsed = !group.isCollapsed;
				groupContent.style.display = group.isCollapsed ? "none" : "block";
				collapseIcon.textContent = group.isCollapsed ? '►' : '▼';
				this.setHighlighted(true);
			});

			groupNameEl.addEventListener("blur", (event) => {
				const newName = groupNameEl.textContent.trim();
				if (newName.length > 0 && newName !== group.groupName) {
					group.groupName = newName;
					this.updateRegexOrderFromDOM();
					this.plugin.saveSettings();
					new Notice("Group name updated.");
				} else {
					groupNameEl.textContent = group.groupName;
				}
			});

			if (dragHandle) this.makeDraggable(groupContainer, dragHandle);

			group.regexes.forEach(regex => addRegexToGroup(groupContent, regex));
		};


		const buttonsContainer = containerEl.createDiv();
		buttonsContainer.style.display = "flex";
		buttonsContainer.style.justifyContent = "space-between";
		buttonsContainer.style.marginBottom = "10px";

		const addGroupButton = buttonsContainer.createEl("button", { text: "Add Group" });
		addGroupButton.addEventListener("click", () => {
			const newGroup = {
				isActive: true,
				groupName: "New Group",
				regexes: []
			};
			this.plugin.settings.regexGroups.push(newGroup);
			this.display();
			this.plugin.saveSettings();
		});

		const addRegexPairButton = buttonsContainer.createEl("button", { text: "Add Regexp" });
		addRegexPairButton.addEventListener("click", () => {
			const newPair = { isActive: false, key: '', regex: '' };
			this.addStandaloneRegexUI(newPair);
			this.plugin.settings.regexPairs.push(newPair);
			this.plugin.saveSettings();
		});

		this.plugin.settings.regexGroups.forEach((group, index) => addGroupUI(group, index));

		if (this.plugin.settings.regexPairs && Array.isArray(this.plugin.settings.regexPairs)) {
			this.plugin.settings.regexPairs.forEach(pair => this.addStandaloneRegexUI(pair));
		}

		this.renderBlacklistUI(containerEl)

	}
	private renderBlacklistUI(containerEl: HTMLElement) {
		containerEl.createEl('h3', {text: 'Blacklist Management'});
		containerEl.createEl('p', {text: 'Enter items to blacklist. These items will not be processed.'});

		const blacklistContainer = containerEl.createDiv();
		this.plugin.settings.blacklist.forEach((item, index) => {
			const itemDiv = blacklistContainer.createDiv();
			itemDiv.textContent = item;

			const removeButton = itemDiv.createEl('button', {text: 'Remove'});
			removeButton.onclick = () => {
				this.plugin.settings.blacklist.splice(index, 1);
				this.plugin.saveSettings().then(() => this.display());
			};
		});

		const addItemInput = containerEl.createEl('input', {type: 'text'});
		const addItemButton = containerEl.createEl('button', {text: 'Add to Blacklist'});
		addItemButton.onclick = () => {
			if (addItemInput.value && !this.plugin.settings.blacklist.includes(addItemInput.value)) {
				this.plugin.settings.blacklist.push(addItemInput.value);
				addItemInput.value = '';
				this.plugin.saveSettings().then(() => this.display());
			}
		};
	}

	createSettingsUI(containerEl) {
		// Ignore Links Toggle
		new Setting(containerEl)
			.setName("Ignore links")
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.ignoreLinks ?? true)
					.onChange(async value => {
						this.plugin.settings.ignoreLinks = value;
						await this.plugin.saveSettings();
					})
					.setTooltip("Do not modify Links, preventing to handle the same data over and over again.");
			});

		new Setting(containerEl)
			.setName("Ignore URLs")
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.ignoreURLs ?? true)
					.onChange(async value => {
						this.plugin.settings.ignoreURLs = value;
						await this.plugin.saveSettings();
					})
					.setTooltip("Do not modify URLs, so they do keep working.");
			});

		new Setting(containerEl)
			.setName("Defang URLs")
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.defangURLs ?? true)
					.onChange(async value => {
						this.plugin.settings.defangURLs = value;
						await this.plugin.saveSettings();
					})
					.setTooltip("Convert https[:]// -> https://");
			});

		new Setting(containerEl)
			.setName("Ignore code blocks")
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.ignoreCodeBlocks ?? false)
					.onChange(async value => {
						this.plugin.settings.ignoreCodeBlocks = value;
						await this.plugin.saveSettings();
					})
					.setTooltip("Ignore content within code blocks when linking regexes.");
			});

		new Setting(containerEl)
			.setName("Save")
			.addButton(button => {
				button.setButtonText("Save")
					.onClick(() => {
						this.saveChanges();
					});
				this.saveButton = button.buttonEl;
			});

		new Setting(containerEl)
			.setName("Reset defaults")
			.addButton(button => {
				button.setButtonText("Reset")
					.onClick(() => {
						const resetConfirm = confirm("Are you sure you want to reset to default settings?");
						if (resetConfirm) {
							this.resetToDefaults();
							if (this.plugin._settingTabReference) {
								this.plugin._settingTabReference.display();
							}
						}
					});
			});
	}


	resetToDefaults() {
		this.plugin.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

		this.plugin.saveSettings().then(() => {
			new Notice("Settings have been reset to defaults.");
			this.display();
		});
	}

	private addStandaloneRegexUI(pair) {
		const row = this.keyValueContainer.createEl("div", { cls: 'flex-row standalone-regex-row' });
		row.style.display = 'flex';
		row.style.alignItems = 'center';

		const dragHandle = row.createEl("span", { className: "drag-handle", text: "☰" });

		const activeCheckbox = row.createEl("input", { type: "checkbox", className: "active-checkbox" });
		activeCheckbox.checked = pair.isActive;

		const keyInput = row.createEl("input", {
			type: "text",
			className: "key-input-flex",
			value: pair.key,
			placeholder: "Description-Key"
		});

		const valueInput = row.createEl("input", {
			type: "text",
			className: "value-input-flex",
			value: pair.regex,
			placeholder: "Regexp"
		});
		valueInput.style.flexGrow = '1';

		const deleteButton = row.createEl("button", { text: "Delete", className: "delete-button" });
		deleteButton.addEventListener("click", () => {
			row.remove();
			this.updateRegexOrderFromDOM();
			this.plugin.saveSettings();
		});

		const inputsContainer = row.createDiv({ cls: 'inputs-container' });
		inputsContainer.append(keyInput, valueInput, deleteButton);
		inputsContainer.style.flexGrow = "1";
		inputsContainer.style.display = "flex";
		inputsContainer.style.justifyContent = "space-between";
		inputsContainer.style.alignItems = "center";

		if (dragHandle) this.makeDraggable(row, dragHandle);
	}
}

export default class RelaxPlugin extends Plugin {
	settings: RelaxPluginSettings;
	_settingTabReference: RelaxSettingTab;

	async onload() {
		await this.loadSettings();

		this._settingTabReference = new RelaxSettingTab(this.app, this);

		this.addSettingTab(this._settingTabReference);
		this.addCommand({id: "relax", name: "R.E.L.A.X.", callback: () => this.addBrackets()});
		this.addCommand({
			id: "relax-add-to-blacklist",
			name: "RELAX: Add to blacklist",
			callback: () => this.addToBlacklist()
		});
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				menu.addItem((item) => {
					item
						.setTitle("R.E.L.A.X.")
						.setIcon("curly-braces")
						.onClick(async () => {
							this.addBrackets();
						});
				});
			})
		);
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				menu.addItem((item) => {
					item
						.setTitle("R.E.L.A.X.")
						.setIcon("curly-braces")
						.onClick(async () => {
							this.addBrackets();
						});
				});
			})
		);
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				menu.addItem((item) => {
					item
						.setTitle("RELAX: Remove all brackets")
						.setIcon("curly-braces")
						.onClick(async () => {
							this.removeBrackets();
						});
				});
			})
		);
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, file) => {
				menu.addItem((item) => {
					item
						.setTitle("RELAX: blacklist selected links")
						.setIcon("curly-braces")
						.onClick(async () => {
							this.addToBlacklist();
						});
				});
			})
		);
		this.registerEvent(this.app.workspace.on("settings:opened", () => {
			if (this._settingTabReference) {
				this._settingTabReference.setHighlighted(false);
			}
		}));
	}

	async resetToDefaults() {
		this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
		await this.saveSettings();
		new Notice("Settings have been reset to defaults.");
	}

	async loadSettings() {
		try {
			const loadedSettings = await this.loadData();
			if (loadedSettings) {
				this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedSettings);
			} else {
				throw new Error("No settings loaded");
			}
		} catch (e) {
			console.error("Error loading settings:", e);
			await this.resetToDefaults();
		}
	}


	onunload() {
	}

	async saveSettings() {
		await this.saveData(this.settings);
		new Notice("Config saved!");
	}

	removeBracketsInSelection(content: string): string {
		return content.replace(/([^!])\[\[([^\]]+)\]\]/g, "$1$2");
	}

	async addBracketsForFile(noteFilePath = "") {
		await this.processFileContent(noteFilePath, (content) => this.updateSelection(content, this.settings));
	}

	async removeBracketsinFile(noteFilePath = "") {
		await this.processFileContent(noteFilePath, this.removeBracketsInSelection);
	}

	async processFileContent(noteFilePath: string, contentProcessor: (content: string) => string, noteFile?: TFile): Promise<void> {
		if (!noteFile && noteFilePath !== "") {
			noteFile = this.app.vault.getAbstractFileByPath(noteFilePath) as TFile;
			if (!noteFile) {
				new Notice(`No file found at the given path: ${noteFilePath}`);
				return;
			}
		} else if (!noteFile) {
			const leaf = this.app.workspace.activeLeaf || this.app.workspace.getLeaf();
			noteFile = leaf.view instanceof MarkdownView ? leaf.view.file : null;

			if (!noteFile) {
				new Notice('No file selected. Please select a markdown file from the editor or navigation bar.');
				return;
			}
		}

		if (!(noteFile instanceof TFile)) {
			new Notice('Selected item is not a valid text file.');
			return;
		}

		let fileContent = await this.app.vault.read(noteFile);
		const updatedContent = contentProcessor(fileContent);
		await this.app.vault.modify(noteFile, updatedContent);
	}

	private renderBlacklistUI(containerEl: HTMLElement) {
		const blacklistSection = containerEl.createEl('div');
		blacklistSection.createEl('h3', { text: 'Blacklist' });
		const listContainer = blacklistSection.createEl('div');

		this.plugin.settings.blacklist.forEach((item, index) => {
			const itemEl = listContainer.createEl('div');
			itemEl.createEl('span', { text: item });
			const removeButton = itemEl.createEl('button', { text: 'Remove' });
			removeButton.onclick = () => {
				this.plugin.settings.blacklist.splice(index, 1);
				this.plugin.saveSettings().then(() => this.display());
			};
		});

		const addItemInput = blacklistSection.createEl('input', { type: 'text' });
		const addItemButton = blacklistSection.createEl('button', { text: 'Add' });
		addItemButton.onclick = () => {
			if (addItemInput.value) {
				this.plugin.settings.blacklist.push(addItemInput.value);
				this.plugin.saveSettings().then(() => this.display());
			}
		};
	}
	updateSelection(content: string, settings: RelaxPluginSettings): string {
		const urlRegex = /(https?:\/\/[^\s]+)/g;
		const excludedExtensions = /\.(exe|lnk|xls|md|sh|elf|bin|tmp|doc|odt|docx|pdf|yara|dll|txt)$/;
		const fangMap = {
			"[.]": ".",
			"[:]": ":"
		};
		if (settings.defangURLs) {
			content = content.replace(/\[\.\]|\[\:\]/g, char => fangMap[char]);
		}

		let updatedText = "";
		const lines = content.split("\n");
		let inCodeBlock = false;

		function containsValidLink(line: string, match: string): boolean {
			const linkRegex = /\[\[.*?\]\]/g;
			let result;
			while ((result = linkRegex.exec(line)) !== null) {
				if (result.index <= line.indexOf(match) && linkRegex.lastIndex >= line.indexOf(match) + match.length) {
					return true;
				}
			}
			return false;
		}

		lines.forEach((line, index) => {
			if (settings.ignoreCodeBlocks && line.trim().startsWith("```")) {
				inCodeBlock = !inCodeBlock;
				updatedText += line + "\n";
				return;
			}

			if (inCodeBlock) {
				updatedText += line + "\n";
				return;
			}

			let modifiedLine = line;

			settings.regexGroups.forEach(group => {
				if (!group.isActive) return;

				group.regexes.forEach(({isActive, regex}) => {
					if (!isActive) return;

					const compiledRegex = new RegExp(regex, "g");
					modifiedLine = modifiedLine.replace(compiledRegex, (match, ...args) => {
						const groups = args.slice(0, -2).filter(g => g !== undefined);
						const capturedValue = groups[0];
						if (settings.blacklist.includes(match)) {
							return match;
						}
						if (!capturedValue) return match;

						if (settings.ignoreLinks && containsValidLink(line, capturedValue)) {
							return match;
						}

						if (settings.ignoreURLs) {
							const urls = Array.from(line.matchAll(urlRegex), m => m[0]);
							let ignoreCurrentMatch = false;

							for (const url of urls) {
								if (!excludedExtensions.test(url) && url.includes(capturedValue)) {
									ignoreCurrentMatch = true;
									break;
								}
							}

							if (ignoreCurrentMatch) {
								return match;
							}
						}

						const offset = args[args.length - 2];
						const precedingChar = offset > 0 ? line[offset - 1] : null;
						const spaceIfBackslash = precedingChar === '\\' ? ' ' : '';

						return `${spaceIfBackslash}[[${match}]]`;
					});
				});
			});

			updatedText += modifiedLine + "\n";
		});

		return updatedText.trim();
	}

	async processMarkdownContent(action: "removeBrackets" | "addBrackets") {
		const activeLeaf = this.app.workspace.activeLeaf;

		if (!activeLeaf) {
			new Notice("Please open a markdown file or select a folder");
			return;
		}

		const view = activeLeaf.view;
		if (!view) {
			new Notice("Unknown item selected. Please select a markdown file or folder");
			return;
		}

		if (view instanceof MarkdownView) {
			const selection = view.editor.getSelection();

			if (selection && selection.trim().length !== 0) {
				let updatedSelection;
				if (action === "removeBrackets") {
					updatedSelection = this.removeBracketsInSelection(selection);
					new Notice("Removed brackets from selection!");
				} else {
					updatedSelection = this.updateSelection(selection, this.settings);
					new Notice("Added brackets in selection!");
				}
				view.editor.replaceSelection(updatedSelection);
				new Notice(action === "removeBrackets" ? "Removed brackets from selection!" : "Updated content in selection!");
			} else {
				if (action === "removeBrackets") {
					await this.removeBracketsinFile();
					new Notice("Removed brackets from entire file!");
				} else {
					await this.addBracketsForFile();
					new Notice("Added brackets on entire file!");
				}
			}
		}
	}

	async removeBrackets() {
		await this.processMarkdownContent("removeBrackets");
	}

	async addBrackets() {
		const activeLeaf = this.app.workspace.activeLeaf;

		if (!activeLeaf || !activeLeaf.view) {
			new Notice("Please open a markdown file or select a folder");
			return;
		}

		if (activeLeaf.view instanceof MarkdownView) {
			const editor = activeLeaf.view.editor;
			const selection = editor.getSelection();

			if (selection && selection.trim().length !== 0) {
				const updatedSelection = this.updateSelection(selection, this.settings);
				editor.replaceSelection(updatedSelection);
				new Notice("Added brackets in selection!");
				return;
			} else {
				const filePath = activeLeaf.view.file.path;
				await this.addBracketsForFile(filePath);
				new Notice("Updated entire file!");
				return;
			}
		}

		function isSelected(item) {
			return item.selfEl && item.selfEl.classList.contains("has-focus");
		}

		let selectedFileItem = null;

		for (const key in activeLeaf.view.fileItems) {
			if (Object.prototype.hasOwnProperty.call(activeLeaf.view.fileItems, key)) {
				const item = activeLeaf.view.fileItems[key];
				if (isSelected(item)) {
					selectedFileItem = item;
					break;
				}
			}
		}

		if (!selectedFileItem) {
			new Notice("No markdown file or folder is currently selected. Please select one.");
			return;
		}

		if (selectedFileItem.collapsible) {
			const folderPath = selectedFileItem.file.path;
			await this.addBracketsForFolder(folderPath);
		} else {
			const filePath = selectedFileItem.file.path;
			await this.addBracketsForFile(filePath);
		}
	}

	async addBracketsForFolder(folderPath: string) {
		const files = this.app.vault.getMarkdownFiles().filter(file => file.path.startsWith(folderPath));
		const totalFiles = files.length;
		let processedFiles = 0;

		const processingNotice = new Notice(`Processing ${totalFiles} files...`, totalFiles * 1000);

		const maxConcurrentTasks = 20;
		const taskQueue = [];

		const processFile = async (file) => {
			await this.addBracketsForFile(file.path);
			processedFiles++;
			processingNotice.setMessage(`Processing file ${processedFiles} of ${totalFiles}`);
			if (taskQueue.length > 0) {
				const nextTask = taskQueue.shift();
				await nextTask();
			}
		};

		const enqueueTask = (file) => {
			if (taskQueue.length < maxConcurrentTasks) {
				taskQueue.push(() => processFile(file));
			} else {
				processFile(file);
			}
		};

		files.forEach(file => enqueueTask(file));

		while (taskQueue.length > 0) {
			const nextTask = taskQueue.shift();
			await nextTask();
		}

		processingNotice.hide();
		new Notice(`All ${totalFiles} files in the folder processed.`);
	}

	async addToBlacklist() {
		const activeLeaf = this.app.workspace.activeLeaf;

		if (!activeLeaf || !activeLeaf.view) {
			new Notice("Please open a markdown file or select a folder");
			return;
		}

		if (activeLeaf.view instanceof MarkdownView) {
			const editor = activeLeaf.view.editor;
			const selection = editor.getSelection();

			if (selection && selection.trim().length !== 0) {
				const links = selection.match(/\[\[([^\]]+)\]\]/g);

				if (links) {
					links.forEach(link => {
						const text = link.replace(/\[\[|\]\]/g, '');
						if (!this.settings.blacklist.includes(text)) {
							this.settings.blacklist.push(text);
						}
					});
					await this.saveSettings();
					new Notice("Added to blacklist!");
					return;
				}
			}
		}

		new Notice("No valid selection found. Please select a valid link.");
	}
}
