import {App, MarkdownView, Notice, Plugin, PluginSettingTab, Setting, TFile} from 'obsidian';

interface RegexNode {
	type: 'regex' | 'group';
	isActive: boolean;
	key?: string;
	regex?: string;
	groupName?: string;
	items?: RegexNode[];
	isCollapsed?: boolean;
}

interface RelaxPluginSettings {
	regexItems: RegexNode[];
	ignoreLinks?: boolean;
	ignoreURLs?: boolean;
	defangURLs?: boolean;
	ignoreCodeBlocks?: boolean;
	removeOnlyUnresolvedLinks?: boolean;
	blacklist: string[];
	languageOverride?: string;
}
const DEFAULT_SETTINGS: RelaxPluginSettings = {
	regexItems: [
		{
			type: 'group',
			isActive: true,
			groupName: "Default RegEx",
			items: [
				{
					type: 'regex',
					isActive: true,
					key: "eMail",
					regex: "([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,})"
				},
				{
					type: 'regex',
					isActive: true,
					key: "Domains",
					regex: "\\b([a-zA-Z0-9\\-\\.]+\\.(?:com|org|net|mil|edu|COM|ORG|NET|MIL|EDU))"
				},
				{
					type: 'regex',
					isActive: false,
					key: "Greedy Domains",
					regex: "\\b([a-zA-Z0-9\\-\\.]+\\.(?:17487|aaa|aarp|abarth|abb|abbott|abbvie|abc|abogado|abudhabi|academy|accenture|accountant|accountants|aco|active|actor|ads|adult|aeg|aero|aetna|afl|africa|agakhan|agency|aig|aigo|airbus|airforce|airtel|akdn|alfaromeo|alibaba|alipay|allfinanz|allstate|ally|alsace|alstom|amazon|americanexpress|amex|amica|amsterdam|analytics|android|any|anz|aol|apartments|app|apple|aquarelle|arab|aramco|archi|army|arpa|art|arte|asia|associates|attorney|auction|audi|audible|audio|auspost|author|auto|autos|aws|axa|azure|baby|baidu|bananarepublic|band|bank|bar|barcelona|barclaycard|barclays|barefoot|bargains|baseball|basketball|bauhaus|bayern|bazar|bbc|bbs|bbt|bbva|bcg|bcn|beauty|beer|bentley|berlin|best|bestbuy|bet|bharti|bible|bid|bike|bing|bingo|bio|bio:|bit|biz|black|blackfriday|blanco|blockbuster|blog|bloomberg|blue|bms|bmw|bnl|bnpparibas|boehringer|bom|bond|boo|book|booking|boots|bosch|bostik|boston|bot|boutique|box|br|bradesco|brand|bridgestone|broadway|broker|brother|brussels|br|bugatti|build|builders|business|buy|buzz|bzh|ca|cab|cafe|cal|call|calvinklein|cam|camera|camp|cancerresearch|canon|capetown|capital|capitalone|car|caravan|cards|care|career|careers|cars|cartier|casa|case|cash|casino|cat|catering|catholic|cba|cbn|cbre|cbs|center|ceo|cern|cfa|cfd|chan|chanel|channel|charity|chase|chat|cheap|chintai|christmas|chrome|chrysler|church|cipriani|circle|cisco|citadel|citi|citic|city|claims|cleaning|click|clinic|clinique|clothing|cloud|club|clubmed|coach|codes|coffee|coin|college|cologne|comcast|commbank|community|company|compare|computer|co|condos|construction|consulting|contact|contractors|cooking|cool|coop|corp|corsica|country|coupon|coupons|courses|cpa|credit|creditcard|creditunion|cricket|crown|crs|cruise|cruises|crypto|csc|cuisinella|cyb|cymru|cyou|dabur|dad|dance|data|date|dating|datsun|day|deal|dealer|deals|degree|delivery|dell|deloitte|delta|democrat|dental|dentist|desi|design|dev|dhl|diamonds|diet|digital|direct|directory|discount|discover|dish|diy|dnp|docs|doctor|dodge|dog|doha|domains|dot|download|drive|dubai|dunlop|dupont|durban|dvag|dyn|earth|eat|eco|edeka|edu|education|email|emc|emerck|energy|engineer|engineering|enterprises|entertainment|epost|epson|equipment|ericsson|erni|esq|estate|esurance|eth|etisalat|eu|eurovision|eus|events|everbank|example|exchange|expert|exposed|express|extraspace|fage|fail|fairwinds|faith|family|fan|fans|farm|farmers|fashion|fast|fedex|feedback|ferrari|ferrero|fiat|fidelity|film|final|finance|financial|fire|firestone|firmdale|fish|fishing|fit|fitness|flickr|flights|flir|florist|flowers|flsmidth|fly|foo|food|foodnetwork|football|ford|forex|forsale|forum|foundation|fox|free|fresenius|frl|frogans|frontdoor|frontier|fujitsu|fujixerox|fun|fund|fur|furniture|futbol|fyi|gal|gallery|gallo|gallup|game|games|gap|garden|gay|gbiz|gdn|gea|geek|gent|genting|gift|gifts|gives|giving|glass|gle|global|globo|gmail|gmbh|gmo|gmx|godaddy|gold|goldpoint|golf|goodyear|goog|google|gop|gopher|gov|grainger|graphics|gratis|green|gripe|grocery|group|guardian|gucci|guide|guitars|guru|hair|hamburg|hangout|haus|hbo|hdfc|hdfcbank|health|healthcare|help|helsinki|here|hermes|hiphop|hisamitsu|hitachi|hiv|hkt|hockey|holdings|holiday|home|homegoods|homes|homesense|honda|honeywell|horse|hospital|host|hosting|hot|hoteles|hotels|hotmail|house|how|hsbc|hughes|hyatt|hyundai|ibm|ice|icu|identity|ieee|ifm|ikano|imdb|immo|immobilien|in|inc|industries|indy|infiniti|info|ing|ink|institute|insurance|insure|int|intel|internal|international|intranet|intuit|invalid|investments|ipiranga|irish|iselect|ist|istanbul|itau|itv|iv|iveco|jaguar|java|jcb|jcp|jeep|jetzt|jewelry|jio|jobs|joburg|joy|jp|jpmorgan|juegos|juniper|kaufen|kddi|kerryhotels|kerrylogistics|kerryproperties|kfh|kia|kim|kinder|kindle|kitchen|kiwi|ko|koeln|komatsu|kosher|kpmg|kpn|kr|krd|kred|ku|kuokgroup|kyoto|lacaixa|ladbrokes|lamborghini|lan|lancaster|lancia|lancome|land|landrover|lanxess|las|lasalle|lat|latrobe|law|lawyer|lds|lease|leclerc|legal|lego|lexus|lgbt|liaison|lib|libre|lidl|life|lifeinsurance|lifestyle|lighting|like|lilly|limited|limo|lincoln|linde|link|lipsy|live|living|lixil|loan|loans|local|localhost|locker|locus|lol|london|lotte|lotto|love|lpl|lplfinancial|ltd|ltda|lundbeck|lupin|luxe|luxury|macys|madrid|maif|maison|makeup|man|management|mango|map|market|marketing|markets|marriott|maserati|mattel|mba|mckinsey|med|media|meet|melbourne|meme|memorial|men|menu|metlife|miami|microsoft|mil|mini|mint|mit|mitsubishi|mlb|mma|mobi|mobile|mobily|moda|moe|moi|mom|monash|money|monster|mormon|mortgage|moscow|moto|motorcycles|mov|movie|movistar|msd|mtn|mtr|museum|music|mutual|nadex|nagoya|name|nationwide|natura|navy|nba|nec|neo|net|netflix|network|neustar|new|newholland|news|nexus|nf|nfl|ngo|nhk|nico|nike|nikon|ninja|nissan|nissay|nokia|northwesternmutual|norton|now|nra|nrw|ntt|null|nyc|o|obi|observer|office|okinawa|omega|one|ong|onion|onl|online|ooo|open|oracle|orange|org|organic|origins|osaka|oss|otsuka|ovh|oz|page|panasonic|paris|parody|partners|parts|party|passagens|pay|pccw|pet|pfizer|pharmacy|philips|phone|photo|photography|photos|physio|piaget|pics|pictet|pictures|pid|pin|ping|pink|pioneer|pirate|pizza|place|play|playstation|plumbing|plus|pohl|poker|politie|porn|post|praxi|press|prime|private|pro|prod|productions|prof|progressive|promo|properties|property|protection|pru|prudential|pub|pwc|qpon|quebec|quest|qvc|racing|radio|read|realestate|realtor|realty|recipes|red|redstone|rehab|reise|reisen|reit|reliance|ren|rent|rentals|repair|report|republican|rest|restaurant|review|reviews|rexroth|rich|ricoh|ril|rio|rip|rm|rmit|rocher|rocks|rodeo|rogers|room|rsvp|rugby|ruhr|run|rwe|ryukyu|saarland|safe|safety|sakura|sale|salon|samsung|sandvik|sandvikcoromant|sanofi|sap|sarl|save|saxo|sbi|sbs|sca|scb|schaeffler|schmidt|scholarships|school|schule|schwarz|science|scjohnson|scor|scot|search|seat|secure|security|seek|select|sener|services|ses|seven|sew|sex|sexy|sfr|shangrila|sharp|shaw|shell|shiksha|shoes|shop|shopping|shouji|show|showtime|shriram|silk|sina|singles|site|ski|skin|sky|skype|sling|smart|smile|sncf|soccer|social|softbank|software|sohu|solar|solutions|song|sony|soy|spa|space|spiegel|sport|spot|spreadbetting|srl|stada|staples|star|starhub|statebank|statefarm|statoil|stc|stcgroup|stockholm|storage|store|stream|studio|study|style|su|sucks|supplies|supply|support|surf|surgery|suzuki|swatch|swiftcover|swiss|sydney|symantec|systems|taipei|talk|taobao|target|tatamotors|tatar|tattoo|tax|taxi|tdk|te|team|tech|technology|tel|telecity|telefonica|temasek|tennis|test|teva|theater|theatre|ti|tickets|tienda|tiffany|tips|tires|tirol|tjx|today|tokyo|tools|top|toray|toshiba|total|tours|town|toyota|toys|trade|trading|training|travel|travelchannel|travelers|travelersinsurance|trust|tube|tui|tunes|tushu|tvs|ubs|uconnect|uk|unicom|university|uno|uol|ups|us|uu|vacations|vanguard|vegas|ventures|verisign|vermögensberater|vermögensberatung|versicherung|vet|viajes|video|vig|viking|villas|vin|vip|virgin|visa|vision|vista|vistaprint|vivo|vlaanderen|vodka|volkswagen|volvo|vote|voting|voto|voyage|vuelos|wales|walmart|walter|wang|wanggou|watch|watches|weather|weatherchannel|webcam|weber|website|wed|wedding|weibo|weir|whoswho|wien|wien:|wiki|williamhill|win|windows|wine|winners|wme|wolterskluwer|woodside|work|works|world|wow|wtc|wtf|xbox|xerox|xfinity|xihuan|xin|xlm|xxx|xyz|yachts|yahoo|yamaxun|yandex|yodobashi|yoga|yokohama|you|youtube|zappos|zara|zero|zil|zip|zippo|zone|zuerich|дети|католик|ком|москва|онлайн|орг|рус|сайт|קום|ابوظبي|اتصالات|ارامكو|بازار|بيتك|شبكة|عرب|كاثوليك|كوم|موبايلي|موقع|कॉम|नेट|भारत|संगठन|বাংলা|คอม|みんな|アマゾン|クラウド|グーグル|コム|ストア|セール|ファッション|ポイント|世界|中|中信|中文网|亚马逊|佛山|八卦|公司|公益|商城|商标|嘉里|嘉里大酒店|在线|大众汽车|工行|广东|慈善|我爱你|手机|政府|机构|淡马锡|移动|网址|网站|网络|联通|诺基亚|谷歌|购物|集团|電訊盈科|飞利浦|香格里拉|닷넷|닷컴|삼성))\\b"
				},
				{
					type: 'regex',
					isActive: true,
					key: "IPv4",
					regex: "\\b((?:(?:(?!1?2?7\\.0\\.0\\.1)(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)))\\b"
				},
				{
					type: 'regex',
					isActive: true,
					key: "GUID",
					regex: "([A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12})"
				},
				{
					type: 'regex',
					isActive: true,
					key: "SHA256",
					regex: "\\b([a-fA-F0-9]{64})\\b"
				},
				{
					type: 'regex',
					isActive: true,
					key: "JARM",
					regex: "\\b([a-fA-F0-9]{62})\\b"
				},
				{
					type: 'regex',
					isActive: true,
					key: "SHA1",
					regex: "\\b([a-fA-F0-9]{40})\\b"
				},
				{
					type: 'regex',
					isActive: true,
					key: "MD5",
					regex: "\\b([a-fA-F0-9]{32})\\b"
				},
				{
					type: 'regex',
					isActive: true,
					key: "Bitcoin",
					regex: "\\b([13]{1}[a-km-zA-HJ-NP-Z1-9]{26,33}|bc1[a-z0-9]{39,59})\\b"
				},
				{
					type: 'regex',
					isActive: true,
					key: "Date",
					regex: "((?:0[1-9]|[12][0-9]|3[01])[\\\\\\/\\.-](?:0[1-9]|1[012])[\\\\\\/\\.-](?:19|20|)\\d\\d)"
				},
				{
					type: 'regex',
					isActive: true,
					key: "Windows Usernames",
					regex: "\\\\Users\\\\+(?!(?:Public|Administrator)\\\\)([^\\\\]+)\\\\"
				},
				{
					type: 'regex',
					isActive: true,
					key: "Markdown \xB4",
					regex: "(?:[\xB4](((?:(?!<br>|\\r|\\n)[^\xB4 ]){4,30}))[\xB4])"
				},
				{
					type: 'regex',
					isActive: true,
					key: "Markdown '",
					regex: "(?:['](((?:(?!<br>|\\r|\\n)[^' ]){4,30}))['])"
				},
				{
					type: 'regex',
					isActive: true,
					key: "CVEs",
					regex: "(CVE-(1999|2\\d{3})-(?!0{4})(0\\d{2}[0-9]|[1-9]\\d{3,}))"
				},
				{
					type: 'regex',
					isActive: true,
					key: "MAC Address",
					regex: "([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})"
				},
				{
					type: 'regex',
					isActive: true,
					key: "Tor Onion Address",
					regex: "\\b((?:https?:\\/\\/)?(?:www)?(\\S*?\\.onion)\\b)"
				},
				{
					type: 'regex',
					isActive: true,
					key: "IPv6 Address",
					regex: "((?:[0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(?:ffff(?::0{1,4}){0,1}:){0,1}(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])|(?:[0-9a-fA-F]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9]))"
				},
				{
					type: 'regex',
					isActive: true,
					key: "SSDeep",
					regex: "(\\d+:[a-z+/A-Z0-9]+:[a-z+/A-Z0-9]+,\\\"[^\\\"]+\\\")"
				},
				{
					type: 'regex',
					isActive: true,
					key: "VT subitter",
					regex: "([0-9a-f]{8} - (?:api|web))"
				},
				{
					type: 'regex',
					isActive: true,
					key: "MAC Adresses",
					regex: "((?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2}))"
				},
				{
					type: 'regex',
					isActive: true,
					key: "Passport",
					regex: "([A-PR-WY][1-9]\\d\\s?\\d{4}[1-9])"
				},
				{
					type: 'regex',
					isActive: true,
					key: "Markdown \u2018",
					regex: "(?:[\u2018](((?:(?!<br>|\\r|\\n)[^\u2018 ]){4,30}))[\u2018])"
				},
				{
					type: 'regex',
					isActive: true,
					key: "Markdown \u2019",
					regex: "(?:[\u2019](((?:(?!<br>|\\r|\\n)[^\u2019 ]){4,30}))[\u2019])"
				},
				{
					type: 'regex',
					isActive: true,
					key: 'Markdown "',
					regex: '(?:["\u201E\u2033\u201D](((?:(?!<br>|\\r|\\n)[^"\u2033\u201D ]){4,30}))["\u2033\u201D])'
				},
				{
					type: 'regex',
					isActive: true,
					key: "Markdown _",
					regex: "(?:[_](((?:(?!<br>|\\r|\\n)[^_ ]){4,30}))[_])"
				},
				{
					type: 'regex',
					isActive: true,
					key: "Markdown \u2018\u2019",
					regex: "(?:[\u2018](((?:(?!<br>|\\r|\\n)[^\u2019 ]){4,30}))[\u2019])"
				},
				{
					type: 'regex',
					isActive: true,
					key: "Signal Frequencies",
					regex: "(\\b[0-9]{1,4}(?:\\.\\d{1,4})?\\s?(Hz|kHz|MHz|GHz)\\b)"
				},
				{
					type: 'regex',
					isActive: true,
					key: "BibTeX Entries",
					regex: "@(article|book|inbook|conference|inproceedings){([^}]+)}"
				},
				{
					type: 'regex',
					isActive: true,
					key: "GPS Coordinates",
					regex: "\\b[+-]?[0-9]{1,2}\\.[0-9]+,\\s*[+-]?[0-9]{1,3}\\.[0-9]+\\b"
				},
				{
					type: 'regex',
					isActive: true,
					key: "ISBN Numbers",
					regex: "\\bISBN\\s?(?:-?13|-10)?:?\\s?[0-9-]{10,17}\\b"
				},
				{
					type: 'regex',
					isActive: true,
					key: "Camera Settings",
					regex: "\\bISO\\s?[0-9]+|f/[0-9.]+|1/[0-9]+\\s?sec\\b"
				},
				{
					type: 'regex',
					isActive: true,
					key: "Historical Dates",
					regex: "\\b(?:[0-9]{1,4} (AD|BC)|[0-9]{1,4}th century)\\b"
				},
				{
					type: 'regex',
					isActive: true,
					key: "Processor Specs",
					regex: "\\bIntel Core i[3579]-[0-9]{4}[HQGU]K?|AMD Ryzen [3579] [0-9]{4}X?\\b"
				},
				{
					type: 'regex',
					isActive: false,
					key: "Base64 Strings",
					regex: "([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?"
				},
				{
					type: 'regex',
					isActive: false,
					key: "Script Language File",
					regex: "([\\w]+\\.(?:py|js|java|cs|cpp|rb|go|php))[\\b]"
				},
				{
					type: 'regex',
					isActive: false,
					key: "Chord Progressions",
					regex: "\\b((?:C|Dm|Em|F|G|Am|Bdim)(?:\\s->\\s(?:C|Dm|Em|F|G|Am|Bdim))*)\\b"
				},
				{
					type: 'regex',
					isActive: false,
					key: "Hex Colors",
					regex: "#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})"
				},
				{
					type: 'regex',
					isActive: false,
					key: "Chemical Elements",
					regex: "\\b(?:H|He|Li|Be|B|C|N|O|F|Ne|Na|Mg|Al|Si|P|S|Cl|Ar|K|Ca)\\b"
				},
				{
					type: 'regex',
					isActive: false,
					key: "Hashtags",
					regex: "#[A-Za-z0-9_]+"
				},
				{
					type: 'regex',
					isActive: false,
					key: "Academic Citations",
					regex: "\\b\\([A-Za-z]+,\\s[0-9]{4}\\)\\b"
				},
				{
					type: 'regex',
					isActive: false,
					key: "Temperature Readings",
					regex: "\\b-?[0-9]+\\s?(\xB0C|\xB0F|K)\\b"
				}
			]
		}
	],
	ignoreLinks: true,
	ignoreCodeBlocks: true,
	defangURLs: true,
	ignoreURLs: false,
	removeOnlyUnresolvedLinks: false,
	languageOverride: "auto",
	blacklist: [
		"github.com", "127.0.0.1", "microsoft.com", "www.youtube.com", "youtube.com",
		"www.microsoft.com", "www.github.com", "medium.com", "www.medium.com", "white",
		"windows", "kaspersky.com", "gmail.com", "domain.com", "www.fireeye.com",
		"researchcenter.paloaltonetworks.com", "www.symantec.com", "www.virustotal.com",
		"www.trendmicro.com", "virustotal.com", "www.Sophos.com", "www.mcafee.com",
		"\\Users\\User\\", "twitter.com", "nytimes.com", "_НЕМЕЦКИЕ_", "www.FireEye.com",
		"fireeye.com", "info@fireeye.com", "alumni.ecnu.edu", "down.51cto.com", "www.djbh.net",
		"www.yingjiesheng.com", "www.recordedfuture.com", "zhidao.baidu.com", "mandiant.com",
		"info@mandiant.com", "126.com", "163.com", "hotmail.com", "qq.com", "sohu.com",
		"yahoo.com", "www.mandiant.com", "FireEye.com", "secureworks.com", "blog.trendmicro.com",
		"trendmicro.com", "www.slideshare.net", "www.pwc.com", "securelist.com", "www.eset.com",
		"asert.arbornetworks.com", "unit42.paloaltonetworks.com", "sert.arbornetworks.com",
		"log.apnic.net", "www.netscout.com", "research.nccgroup.com", "intelligence@kaspersky.com",
		"update.iaacstudio.com", "bleepingcomputer.com", "campuscodi@xmpp.is", "::", "_LOCAL_",
		"_CURRENT_", "intelreports@kaspersky.com", "www.welivesecurity.com", "attack.mitre.org",
		"www.clearskysec.com", "blog.talosintelligence.com", "itsec.eicp.net", "pastebin.com",
		"research.checkpoint.com", "www.proofpoint.com", "en.wikipedia.org", "::C", "docs.microsoft.com",
		"www.bleepingcomputer.com", "_process_", "blog.malwarebytes.com", "e::", "_file_", "0.0.0.0",
		"::F", "info@clearskysec.com", "mp.weixin.qq.com", "www.crowdstrike.com", "_EXECUTE_",
		"'Public'", "ti.qianxin.com", "_string_", "google.com", "_meteor_", "_name_", "d::",
		"onlinenic-enduser@onlinenic.com", "welivesecurity.com", "www.google.com", "www.cybereason.com",
		"icann.org", "_content_", "\\Users\\user\\", "www.facebook.com", "\"name\"",
		"securityintelligence.com", "www.secureworks.com", "_data_", "news.sophos.com", "Microsoft.NET",
		"www.threatgeek.com", "www.zdnet.com", "raw.githubusercontent.com", "www.fidelissecurity.com",
		"ti.360.net", "blogs.blackberry.com", "\"POST\"", "_FILE_", "cdn.discordapp.com",
		"pic.twitter.com", "msdn.microsoft.com", "::c", "krebsonsecurity.com",
		"symantec-enterprise-blogs.security.com", "_dropper_", "www.reuters.com",
		"BleepingComputer.com", "soft@hotmail.com", "ASP.NET", "8.8.8.8", "_DATA_", "www.wired.com",
		"proofpoint.com", "\"Mandiant\"", "\\Users\\admin\\", "_Trojan_", "reeye.com", "\"value\"",
		"thedfirreport.com", "threatpost.com", "'\"{0}\"'", "info@lifars.com", "LIFARS.com",
		"_from_", "au.com", "isc.sans.edu", "protonmail.com", "asec.ahnlab.com", "www.threatconnect.com",
		"www.dropbox.com", "\"true\"", "www.nytimes.com", "crowdstrike.com", "drive.google.com",
		"\"white\"", "\"WScript.Shell\"", "www.arbornetworks.com", "docs.google.com", "_DOMAIN_",
		"www.virusbulletin.com", "_creation/win_", "whois.arin.net", "_Backdoor_", "citizenlab.org",
		"www.fortinet.com", "Snort.org", "::A", "web.archive.org", "_sample_", "_proc_", "_hash_",
		"fortinet.com", "www.readability.com", "doi.org", "192.168.1.1", "_decrypt_", "blog.yoroi.com",
		"\"data\"", "F-Secure.com", "\"informational\"", "www.group-ib.com", "gcat.google.com",
		"www.linkedin.com", "contact@idcprivacy.com", "_COMMON_", "\"type\"", "_client_", "\"&bs&\"",
		"threatintel@eset.com", "blog.netlab.360.com", "\\Users\\<user>\\", "_part_", "pandasecurity.com",
		"technet.microsoft.com", "\\Users\\username\\", "www.morphisec.com", "'\\x00'", "avsvmcloud.com",
		"1.0.0.0", "_PROCESS_", "_ATTRIBUTE_", "www.bbc.com", "www.volexity.com", "::cb",
		"securingtomorrow.mcafee.com", "www.w3.org", "withheldforprivacy.com", "www.ptsecurity.com",
		"_FLAG_", "_read_", "talosintelligence.com", "_write_", "\\Users\\<username>\\", "_entry_",
		"_value_", "_TYPE_", "_user_", "a::", "facebook.com", "\"false\"", "\"cmd.exe\"", "_config_",
		"1.1.1.1", "_init_", "_CLASSES_", "www.f-secure.com", "www.washingtonpost.com", "clearskysec.com",
		"info@cyberkov.com", "_module_", "_object_", "zscaler.com", "www.apple.com", "::E",
		"api.telegram.org", "www.cyberkov.com", "blogs.microsoft.com", "cybersecurity.att.com",
		"www.cisco.com", "api.ipify.org", "dragos.com", "www.freebuf.com", "www.kaspersky.com",
		"_server_", "blog.group-ib.com", "talos-external@cisco.com", "_DEVICE_", "_Hunting_",
		"schemas.microsoft.com", "www.intezer.com", "objective-see.com", "1.3.6.1", "group-ib.com",
		"\"UTF-8\"", "_Donut_", "_QUERY_", "example.com", "link.linkipv6.com", "CyWatch@fbi.gov",
		"www.paloaltonetworks.com", "ddns.net", "www.amnesty.org", "www.darkreading.com", "archive.org",
		"\"file\"", "sentinelone.com", "_payload_", "'value'", "ptsecurity.com", "_encrypted_",
		"_security_", "_with_", "æCheersÆ", "\"kernel32.dll\"", "blog.cyble.com", "_Win32_", "_type_",
		"symantec.com", "\"path\"", "\"Port\"", "_command_", "gist.github.com", "wikileaks.org",
		"thehackernews.com", "_WITH_", "www.bitly.com", "dawn.pakgov.org", "_next_", "bitly.com",
		"\"UTF-16LE\"", "contagiodump.blogspot.com", "www.exploit-db.com", "\"config\"", "intezer.com",
		"cybereason.com", "support.microsoft.com", "_random_", "_block_", "\"Microsoft\"",
		"sites.google.com", "_FILES_", "_SYSTEM_", "_operand_", "www.blackhat.com", "www.anomali.com",
		"\"Scripting.FileSystemObject\"", "_NOTIFY_", "\"process\"", "\"Jitter\"", "blog.avast.com",
		"\"server\"", "_Loader_", "\"event\"", "\"Platinum\"", "schemas.xmlsoap.org",
		"www.theguardian.com", "blog.morphisec.com", "tutanota.com", "_Report_", "_line_", "_THREAD_",
		"_DIRECTORY_", "www.sophos.com", "_target_", "mail.com", "\\Users\\Admin\\", "s.certfa.com",
		"_2-gram_", "\"tok-go\"", "_sequence_", "api.faceit.com", "www.securityweek.com", "www.sans.org",
		"www.accenture.com", "www.icann.org", "_Shell_", "labs.sentinelone.com", "\"powershell.exe\"",
		"www.secpulse.com", "_executable_", "WWW.LOGRHYTHM.COM", "\"ES_EVENT_", "cylera.com",
		"cdnlist.net", "id-ransomware.blogspot.com", "\"NCSC\"", "exploitreversing.com", "www.wsj.com",
		"community.riskiq.com", "blog.certfa.com", "judystevenson.info", "boozallen.com", "\"hidden_cobra\"",
		"_header_", "_func_", "WWW.VIRUSBULLETIN.COM", "www.torproject.org", "\"Start\"", "_FONT_",
		"SecPulse.COM", "tinyurl.com", "\"password\"", "apple.com", "blogs.technet.com",
		"www.idcprivacy.com", "_local_", "arstechnica.com", "www.bitdefender.com", "_public_",
		"\"sha1\"", "_PHONE_", "marcoramilli.com", "_update_", "trustwave.com", "i.imgur.com",
		"customerportal.solarwinds.com", "www.zscaler.com", "_path_", "_start_", "\"time\"",
		"\"C:\\Windows\\System32\\cmd.exe\"", "\"root\"", "_host_", "æalyac.org", "taskmgr.servehttp.com",
		"_stomp_", "\"Polling\"", "www.bloomberg.com", "www.akamai.com", "threatrecon.nshc.net",
		"_service_", "msrc.microsoft.com", "learn.microsoft.com", "\"base64\"", "_REQUEST_",
		"private.directinvesting.com", "\\Users\\USER\\", "_HOMEUNIX_", "recordedfuture.com",
		"malware-traffic-analysis.net", "ip-api.com", "_VERSION_", "blog.eset.com", "\"sha256\"",
		"_REL32_", "www.forbes.com", "nakedsecurity.sophos.com", "_CREATE_", "\"username\"", "_libc_",
		"assadcrimes.info", "stemtopx.com", "intel471.com", "vblocalhost.com", "\"open\"", "_READ_",
		"service.clickaway.com", "www.LIFARS.com", "team-cymru.com", "_table_", "_SECTION_", "::Dec",
		"\"__main_", "_kernel32_", "_GLOB_", "www.threatexpert.com", "media.kasperskycontenthub.com",
		"naver.com", "zdnet.com", "\"Wscript.Shell\"", "iplogger.org", "_stack_", "_STATUS_",
		"cderlearn.com", "_creation/proc_", "'bytes'", "threatvector.cylance.com", "\"port\"",
		"\"REG_DWORD\"", "techcommunity.microsoft.com", "\"\\x00\"", "www.km153.com", "_files_",
		"www.sentinelone.com", "ww.recordedfuture.com", "_ENTRY_", "_call_", "_current_", "::a", "æ",
		"_list_", "reyweb.com", "\"center\"", "_EXTERNAL_", "'__main_", "_Webshell_", "play.google.com",
		"'utf-8'", "www.godaddy.com", "\"submit\"", "info@FireEye.com", "_inthe_", "threatconnect.com",
		"intrusiontruth.wordpress.com", "\\Users\\Username\\", "mcafee.com", "_main_", "E::", "de.com",
		"ætypeÆ", "'false'", "_susp_", "_START_", "_DISK_", "_apt38_", "_check_", "www.mediafire.com",
		"info@circl.lu", "wordkeyvpload.net", "_APT1_", "_packet_", "_buffer_", "_IMAGE_",
		"www.blackberry.com", "plus.google.com", "_code_", "\"REG_SZ\"", "securityscorecard.com",
		"\"True\"", "\"start\"", "_internal_", "photobucket.com", "\"Name\"", "192.168.0.1",
		"pwc.blogs.com", "labs.bitdefender.com", "_HIGHNOON_", "_Ransomware_", "_INFO_",
		"æpath.alyac.org", "com.ga", "\"utf-8\"", "_cobra_", "VB.NET", "_frame_", "_Generic_",
		"_Dropper_", "rdap.arin.net", "submit@malware.us-cert.gov", "www.csoonline.com",
		"www.amazon.com", "\"Content-Type\"", "_method_", "\"arguments\"", "redcanary.com",
		"\\Users\\*\\", "www.langner.com", "_pass_", "EFF.ORG", "www.securityscorecard.com",
		"info.publicintelligence.net", "documents.trendmicro.com", "\"user\"", "www.bing.com",
		"æTeamSpyÆ", "gitlab.com", "\"Type\"", "_/\\/\\_", "\"Base\"", "process.com", "255.255.255.0",
		"_memory_", "_2020_", "_encoded_", "otx.alienvault.com", "_system_", "phdays.com",
		"\"DistinguishedName\"", "\"ScopeOfSearch\"", "\"SearchFilter\"", "\"member=*\"",
		"www.apache.org", "_resolve_", "\"client\"", "_version_", "\"text\"", "_OPTION_",
		"report@cisa.gov", "\"system\"", "\"hostname\"", "10.0.0.1", "Cybersecurity_Requests@nsa.gov",
		"\\Users\\\\%username%\\", "topsec2014.com", "_section_", "greensky27.vicp.net", "_stub_",
		"www.carbonblack.com", "\\Users\\%username%\\", "_time_", "GODADDY.COM", "www.cyberark.com",
		"sharingmymedia.com", "we11point.com", "\\Users\\IEUser\\", "coldsealus.fatcow.com",
		"www.researchbundle.com", "wilcarobbe.com", "xml.ssdsandbox.net", "_size_", "_exploit_",
		"www.ahnlab.com", "\"White\"", "_return_", "\".exe\"", "www.exatrack.com", "_SystemCall_",
		"\"hidden\"", "bitbucket.org", "com.net", "_nagy_", "0v2x.blogspot.com", "\"NO_CHANGE\"",
		"_Threat_", "_access_", "_EXPORT_", "_proxy_", "www.cyberscoop.com", "www.yahoo.com",
		"www.namecheap.com", "blog.checkpoint.com", "_win32_", "::f", "::e", "aol.com", "_BOOT_",
		"_ACCESS_", "_Fidelis_", "_delegate_", "_ENGLISH_", "tr.com", "'udbcgiut.dat'",
		"papagujjiiiiii.blogspot.com", "9ke6n.blogspot.com", "joexpediagroup.com", "_NtElevation_",
		"_last_", "www.cve.mitre.org", "_CONTROL_", "_EXPAND_", "www.bankinfosecurity.com",
		"www.contextis.com", "WeLiveSecurity.com", "blog.reversinglabs.com", "\"test\"", "_STACK_",
		"_byte_", "blog.fox-it.com", "bannetwork.org", "Mitre.org", "LinkedIn.com", "RiskIQ.com",
		"MEI.edu", "Twitter.com", "AtlanticCouncil.org", "Certfa.com", "Proofpoint.com", "FB.com",
		"Yubico.com", "Mandiant.com", "outlook.com"
	]
};

const TRANSLATIONS: Record<string, Record<string, string>> = {
	en: { add_group: "Add Group", add_regex: "Add Regex", add_single_regex: "Add Single Regex", del_group: "✕", desc_key: "Description", regexp: "Regexp", unnamed_group: "Unnamed Group", blacklist: "Blacklist", blacklist_placeholder: "Add term...", add: "Add", blacklist_empty: "Empty.", ignore_links: "Ignore Links", ignore_urls: "Ignore URLs", defang_urls: "Defang URLs", ignore_code: "Ignore Code", remove_unresolved: "Remove unresolved only", reset: "Reset", apply_relax: "Apply R.E.L.A.X.", remove_all: "Remove brackets", invalid_regex: "Invalid.", multiple_groups: "Max 1 group.", lang: "Language" },
	de: { add_group: "Gruppe hinzufügen", add_regex: "+ Regex", add_single_regex: "Einzel-Regex", del_group: "✕", desc_key: "Beschreibung", regexp: "Regexp", unnamed_group: "Unbenannt", blacklist: "Blacklist", blacklist_placeholder: "Begriff...", add: "Hinzufügen", blacklist_empty: "Leer.", ignore_links: "Links ignorieren", ignore_urls: "URLs ignorieren", defang_urls: "URLs entschärfen", ignore_code: "Code ignorieren", remove_unresolved: "Nur ungelöste entfernen", reset: "Zurücksetzen", apply_relax: "R.E.L.A.X. anwenden", remove_all: "Klammern entfernen", invalid_regex: "Ungültig.", multiple_groups: "Max 1 Gruppe.", lang: "Sprache" }
};

function debounce(func: Function, wait: number) {
	let timeout: NodeJS.Timeout;
	return function(this: any, ...args: any[]) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(this, args), wait);
	};
}

class RelaxSettingTab extends PluginSettingTab {
	plugin: RelaxPlugin;
	keyValueContainer: HTMLDivElement;
	debouncedSave: Function;

	draggedEl: HTMLElement | null = null;
	dragType: 'group' | 'regex' | null = null;
	isResizing = false;

	constructor(app: App, plugin: RelaxPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.debouncedSave = debounce(() => this.updateRegexOrderFromDOM(), 300);
	}

	t(key: string): string {
		let lang = this.plugin.settings.languageOverride;
		if (!lang || lang === "auto") {
			lang = window.moment?.locale()?.substring(0, 2) || 'en';
		}
		if (!TRANSLATIONS[lang]) lang = 'en';
		return TRANSLATIONS[lang][key] || TRANSLATIONS['en'][key] || key;
	}

	updateRegexOrderFromDOM(container: HTMLElement = this.keyValueContainer): RegexNode[] {
		const items: RegexNode[] = [];

		Array.from(container.children).forEach(el => {
			if (el.classList.contains("group-container")) {
				const groupEl = el as HTMLElement;
				const nameEl = groupEl.querySelector(".regex-group-name");
				const activeCb = groupEl.querySelector(".group-active-checkbox") as HTMLInputElement;
				const contentDiv = groupEl.querySelector(".regex-group-content") as HTMLElement;

				items.push({
					type: 'group',
					isActive: activeCb ? activeCb.checked : false,
					groupName: nameEl ? nameEl.textContent || "" : "",
					items: this.updateRegexOrderFromDOM(contentDiv),
					isCollapsed: contentDiv ? contentDiv.style.display === "none" : false
				});
			} else if (el.classList.contains("regex-item")) {
				const keyIn = el.querySelector(".key-input-flex") as HTMLInputElement;
				const valIn = el.querySelector(".value-input-flex") as HTMLElement;
				const actCb = el.querySelector(".active-checkbox") as HTMLInputElement;

				items.push({
					type: 'regex',
					isActive: actCb ? actCb.checked : false,
					key: keyIn ? keyIn.value : "",
					regex: valIn ? valIn.textContent || "" : ""
				});
			}
		});

		if (container === this.keyValueContainer) {
			this.plugin.settings.regexItems = items;
			this.plugin.saveSettings();
		}

		return items;
	}

	setupDrag(el: HTMLElement, type: 'group' | 'regex', handle: HTMLElement) {
		handle.addEventListener('mousedown', (e) => { e.stopPropagation(); el.setAttribute('draggable', 'true'); });
		handle.addEventListener('mouseup', (e) => { e.stopPropagation(); el.setAttribute('draggable', 'false'); });
		handle.addEventListener('mouseleave', (e) => { e.stopPropagation(); el.setAttribute('draggable', 'false'); });

		el.addEventListener('dragstart', (e) => {
			e.stopPropagation();
			this.draggedEl = el;
			this.dragType = type;
			setTimeout(() => el.classList.add('hide'), 0);
			if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
		});

		el.addEventListener('dragend', (e) => {
			e.stopPropagation();
			if (this.draggedEl) {
				this.draggedEl.classList.remove('hide');
				this.draggedEl.setAttribute('draggable', 'false');
				this.draggedEl = null;
				this.dragType = null;
				document.querySelectorAll('.drag-over-top, .drag-over-bottom, .drag-over-container').forEach(node =>
					node.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-container'));
				this.updateRegexOrderFromDOM();
			}
		});

		el.addEventListener('dragover', (e) => {
			e.preventDefault();
			e.stopPropagation();
			if (!this.draggedEl || this.draggedEl === el || el.contains(this.draggedEl)) return;

			document.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach(node => node.classList.remove('drag-over-top', 'drag-over-bottom'));

			const rect = el.getBoundingClientRect();
			if (e.clientY < rect.top + rect.height / 2) {
				el.classList.add('drag-over-top');
			} else {
				el.classList.add('drag-over-bottom');
			}
		});

		el.addEventListener('dragleave', (e) => {
			e.stopPropagation();
			el.classList.remove('drag-over-top', 'drag-over-bottom');
		});

		el.addEventListener('drop', (e) => {
			e.preventDefault();
			e.stopPropagation();
			el.classList.remove('drag-over-top', 'drag-over-bottom');

			if (!this.draggedEl || this.draggedEl === el || el.contains(this.draggedEl)) return;

			const rect = el.getBoundingClientRect();
			if (e.clientY < rect.top + rect.height / 2) {
				el.parentNode?.insertBefore(this.draggedEl, el);
			} else {
				el.parentNode?.insertBefore(this.draggedEl, el.nextSibling);
			}
		});
	}

	saveCaret(el: HTMLElement) {
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return 0;
		const range = selection.getRangeAt(0);
		const preCaret = range.cloneRange();
		preCaret.selectNodeContents(el);
		preCaret.setEnd(range.endContainer, range.endOffset);
		return preCaret.toString().length;
	}

	restoreCaret(el: HTMLElement, pos: number) {
		const selection = window.getSelection();
		if (!selection) return;
		const range = document.createRange();
		let currentPos = 0;
		let found = false;

		function traverse(node: Node) {
			if (found) return;
			if (node.nodeType === Node.TEXT_NODE) {
				const len = node.textContent?.length || 0;
				if (currentPos + len >= pos) {
					range.setStart(node, pos - currentPos);
					found = true;
				} else currentPos += len;
			} else {
				for (let i = 0; i < node.childNodes.length; i++) traverse(node.childNodes[i]);
			}
		}
		traverse(el);
		if (!found) {
			range.selectNodeContents(el);
			range.collapse(false);
		} else {
			range.collapse(true);
		}
		selection.removeAllRanges();
		selection.addRange(range);
	}

	highlightRegex(val: string): string {
		if (!val) return "";
		const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		let openIndex = -1;
		let closeIndex = -1;
		const stack: number[] = [];

		for (let i = 0; i < val.length; i++) {
			if (val[i] === '\\') { i++; continue; }
			if (val[i] === '(') {
				if (val[i + 1] === '?') stack.push(-1);
				else stack.push(i);
			} else if (val[i] === ')') {
				const start = stack.pop();
				if (start !== undefined && start !== -1 && openIndex === -1) {
					openIndex = start;
					closeIndex = i;
				}
			}
		}

		if (openIndex !== -1 && closeIndex !== -1) {
			return escape(val.substring(0, openIndex + 1)) +
				'<span class="regex-preview-highlight">' + escape(val.substring(openIndex + 1, closeIndex)) + '</span>' +
				escape(val.substring(closeIndex));
		}
		return '<span class="regex-preview-highlight">' + escape(val) + '</span>';
	}

	validateAndUpdate(editableDiv: HTMLElement) {
		const val = editableDiv.textContent || "";
		let errorMsg = "";
		let isInvalid = false;
		try {
			new RegExp(val);
			const groupCount = (val.match(/\((?!\?)/g) || []).length;
			if (groupCount > 1) {
				isInvalid = true;
				errorMsg = this.t('multiple_groups');
			}
		} catch (e) {
			isInvalid = true;
			errorMsg = this.t('invalid_regex');
		}

		if (isInvalid) editableDiv.classList.add("invalid-border");
		else editableDiv.classList.remove("invalid-border");

		let errorSpan = editableDiv.parentElement?.querySelector(".regex-error");
		if (!errorSpan && isInvalid) {
			errorSpan = document.createElement("span");
			errorSpan.className = "regex-error";
			editableDiv.parentElement?.appendChild(errorSpan);
		}
		if (errorSpan) errorSpan.textContent = errorMsg;

		const caretPos = this.saveCaret(editableDiv);
		editableDiv.innerHTML = this.highlightRegex(val);
		if (document.activeElement === editableDiv) {
			this.restoreCaret(editableDiv, caretPos);
		}
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();

		this.keyValueContainer = containerEl.createEl("div", { cls: "keyValueContainer" });

		this.keyValueContainer.addEventListener('dragover', (e) => {
			if (!this.draggedEl) return;
			e.preventDefault();
		});

		this.keyValueContainer.addEventListener('drop', (e) => {
			e.preventDefault();
			if (this.draggedEl) {
				const target = e.target as HTMLElement;
				if (!target.closest('.regex-group-content')) {
					this.keyValueContainer.appendChild(this.draggedEl);
					this.updateRegexOrderFromDOM();
				}
			}
		});

		document.addEventListener('mousemove', (e) => {
			if (!this.isResizing) return;
			const rect = this.keyValueContainer.getBoundingClientRect();
			let percentage = ((e.clientX - rect.left) / rect.width) * 100;
			percentage = Math.max(10, Math.min(percentage, 90));
			this.keyValueContainer.style.setProperty('--key-width', `${percentage}%`);
		});

		document.addEventListener('mouseup', () => this.isResizing = false);

		this.createSettingsUI(containerEl);

		const addRegexItem = (container: HTMLElement, regex: any) => {
			const row = container.createEl("div", { cls: 'regex-item' });
			const dragHandle = row.createEl("span", { cls: "drag-handle", text: "☰" });
			const activeCheckbox = row.createEl("input", { type: "checkbox", cls: "active-checkbox" });
			activeCheckbox.checked = regex.isActive;
			activeCheckbox.addEventListener("change", () => this.debouncedSave());

			const keyInput = row.createEl("input", { type: "text", cls: "key-input-flex", value: regex.key, placeholder: this.t('desc_key') });
			keyInput.addEventListener("input", () => this.debouncedSave());

			const resizer = row.createDiv({ cls: 'resizer' });
			resizer.addEventListener('mousedown', (e) => { e.preventDefault(); this.isResizing = true; });

			const valWrapper = row.createDiv({ cls: "value-input-wrapper" });
			const valueInput = valWrapper.createEl("div", { cls: "value-input-flex" });
			valueInput.setAttribute("contenteditable", "true");
			valueInput.setAttribute("spellcheck", "false");
			valueInput.textContent = regex.regex;

			this.validateAndUpdate(valueInput);

			valueInput.addEventListener("input", () => {
				this.validateAndUpdate(valueInput);
				this.debouncedSave();
			});

			const deleteButton = row.createEl("button", { text: this.t('del_group'), cls: "delete-button" });
			deleteButton.addEventListener("click", () => { row.remove(); this.debouncedSave(); });

			this.setupDrag(row, 'regex', dragHandle);
		}

		const addGroupUI = (group: RegexNode) => {
			const groupContainer = this.keyValueContainer.createEl("div", { cls: 'group-container' });
			const groupHeader = groupContainer.createEl("div", { cls: "regex-group-header" });
			const groupNameAndControls = groupHeader.createDiv({ cls: "group-name-and-controls" });

			const dragHandle = groupNameAndControls.createEl("span", { cls: "drag-handle", text: "☰" });
			const collapseIcon = groupNameAndControls.createEl("span", { text: group.isCollapsed ? '►' : '▼' });
			collapseIcon.style.cursor = "pointer"; collapseIcon.style.marginRight = "8px";

			const groupActiveCheckbox = groupNameAndControls.createEl("input", { type: 'checkbox', cls: 'group-active-checkbox' });
			groupActiveCheckbox.checked = group.isActive;

			const groupNameEl = groupNameAndControls.createEl("span", { cls: "regex-group-name", text: group.groupName });
			groupNameEl.setAttribute("contenteditable", "true");
			groupNameEl.style.fontWeight = "bold"; groupNameEl.style.marginLeft = "8px";

			const controlButtons = groupHeader.createDiv({ cls: "control-buttons" });
			const addRegexButton = controlButtons.createEl("button", { text: this.t('add_regex') });
			const deleteGroupButton = controlButtons.createEl("button", { text: this.t('del_group'), cls: "delete-button" });

			const groupContent = groupContainer.createEl("div", { cls: 'regex-group-content' });
			groupContent.style.display = group.isCollapsed ? "none" : "block";

			groupContent.addEventListener('dragover', (e) => {
				if (!this.draggedEl || this.draggedEl === groupContainer || groupContainer.contains(this.draggedEl)) return;
				e.preventDefault(); e.stopPropagation();
				groupContent.classList.add('drag-over-container');
			});
			groupContent.addEventListener('dragleave', () => groupContent.classList.remove('drag-over-container'));
			groupContent.addEventListener('drop', (e) => {
				if (!this.draggedEl || this.draggedEl === groupContainer || groupContainer.contains(this.draggedEl)) return;
				e.preventDefault(); e.stopPropagation();
				groupContent.classList.remove('drag-over-container');
				groupContent.appendChild(this.draggedEl);
				this.updateRegexOrderFromDOM();
			});

			groupActiveCheckbox.addEventListener("change", () => this.debouncedSave());
			addRegexButton.addEventListener("click", () => {
				this.updateRegexOrderFromDOM();
				addRegexItem(groupContent, { isActive: true, key: "", regex: "" });
				this.debouncedSave();
			});
			deleteGroupButton.addEventListener("click", () => { groupContainer.remove(); this.debouncedSave(); });

			collapseIcon.addEventListener("click", () => {
				const collapsed = groupContent.style.display !== "none";
				groupContent.style.display = collapsed ? "none" : "block";
				collapseIcon.textContent = collapsed ? '►' : '▼';
				this.debouncedSave();
			});

			groupNameEl.addEventListener("blur", () => {
				if (groupNameEl.textContent?.trim() === "") groupNameEl.textContent = this.t('unnamed_group');
				this.debouncedSave();
			});

			this.setupDrag(groupContainer, 'group', dragHandle);
			if (group.items) {
				group.items.forEach((r: RegexNode) => addRegexItem(groupContent, r));
			}
		};

		const btnContainer = containerEl.createDiv({ style: "display: flex; gap: 10px; margin-bottom: 15px;" });
		const addGroupBtn = btnContainer.createEl("button", { text: this.t('add_group') });
		addGroupBtn.addEventListener("click", () => {
			this.updateRegexOrderFromDOM();
			this.plugin.settings.regexItems.unshift({ type: 'group', isActive: true, groupName: this.t('unnamed_group'), items: [] });
			this.display();
		});

		const addSingleBtn = btnContainer.createEl("button", { text: this.t('add_single_regex') });
		addSingleBtn.addEventListener("click", () => {
			this.updateRegexOrderFromDOM();
			this.plugin.settings.regexItems.unshift({ type: 'regex', isActive: true, key: '', regex: '' });
			this.display();
		});

		if (this.plugin.settings.regexItems) {
			this.plugin.settings.regexItems.forEach(node => {
				if (node.type === 'group') {
					addGroupUI(node);
				} else if (node.type === 'regex') {
					addRegexItem(this.keyValueContainer, node);
				}
			});
		}

		new Setting(containerEl)
			.setName(this.t('lang'))
			.addDropdown(drop => drop
				.addOption("auto", "Auto")
				.addOption("en", "English")
				.addOption("de", "Deutsch")
				.setValue(this.plugin.settings.languageOverride || "auto")
				.onChange(async val => { this.plugin.settings.languageOverride = val; await this.plugin.saveSettings(); this.display(); })
			);

		this.renderBlacklistUI(containerEl);
	}

	private renderBlacklistUI(containerEl: HTMLElement) {
		containerEl.createEl('h3', {text: this.t('blacklist'), cls: 'blacklist-header'});
		const mainContainer = containerEl.createDiv({cls: 'blacklist-main-container'});
		const inputContainer = mainContainer.createDiv({cls: 'flex-row'});
		inputContainer.style.gap = "10px";
		inputContainer.style.marginBottom = "10px";

		const addItemInput = inputContainer.createEl('input', {type: 'text', placeholder: this.t('blacklist_placeholder')});
		addItemInput.style.flex = "1";
		const addItemButton = inputContainer.createEl('button', {text: this.t('add')});

		const addAction = async () => {
			const val = addItemInput.value.trim();
			if (val && !this.plugin.settings.blacklist.includes(val)) {
				this.plugin.settings.blacklist.push(val);
				addItemInput.value = '';
				await this.plugin.saveSettings();
				this.display();
			}
		};

		addItemButton.onclick = addAction;
		addItemInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') addAction();
		});

		const listContainer = mainContainer.createDiv({cls: 'blacklist-list-container'});
		if (this.plugin.settings.blacklist.length === 0) {
			const emptyMsg = listContainer.createDiv();
			emptyMsg.textContent = this.t('blacklist_empty');
			emptyMsg.style.color = "var(--text-muted)";
			emptyMsg.style.padding = "10px";
			emptyMsg.style.textAlign = "center";
		}

		this.plugin.settings.blacklist.forEach((item, index) => {
			const itemDiv = listContainer.createDiv({cls: 'blacklist-item flex-row'});
			itemDiv.createSpan({text: item});
			const removeButton = itemDiv.createEl('button', {text: '✕', cls: 'blacklist-remove-btn'});
			removeButton.onclick = async () => {
				this.plugin.settings.blacklist.splice(index, 1);
				await this.plugin.saveSettings();
				this.display();
			};
		});
	}

	createSettingsUI(containerEl: HTMLElement) {
		new Setting(containerEl).setName(this.t('ignore_links')).addToggle(t => t.setValue(this.plugin.settings.ignoreLinks ?? true).onChange(async v => { this.plugin.settings.ignoreLinks = v; await this.plugin.saveSettings(); }));
		new Setting(containerEl).setName(this.t('ignore_urls')).addToggle(t => t.setValue(this.plugin.settings.ignoreURLs ?? true).onChange(async v => { this.plugin.settings.ignoreURLs = v; await this.plugin.saveSettings(); }));
		new Setting(containerEl).setName(this.t('defang_urls')).addToggle(t => t.setValue(this.plugin.settings.defangURLs ?? true).onChange(async v => { this.plugin.settings.defangURLs = v; await this.plugin.saveSettings(); }));
		new Setting(containerEl).setName(this.t('ignore_code')).addToggle(t => t.setValue(this.plugin.settings.ignoreCodeBlocks ?? false).onChange(async v => { this.plugin.settings.ignoreCodeBlocks = v; await this.plugin.saveSettings(); }));
		new Setting(containerEl).setName(this.t('remove_unresolved')).addToggle(t => t.setValue(this.plugin.settings.removeOnlyUnresolvedLinks ?? false).onChange(async v => { this.plugin.settings.removeOnlyUnresolvedLinks = v; await this.plugin.saveSettings(); }));
		new Setting(containerEl).setName(this.t('reset')).addButton(b => b.setButtonText(this.t('reset')).setWarning().onClick(async () => { if (confirm("Reset all?")) { await this.plugin.resetToDefaults(); this.display(); } }));
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
		this.addCommand({id: "relax-add-to-blacklist", name: "RELAX: Add to blacklist", callback: () => this.addToBlacklist()});

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				menu.addItem((item) => {
					item.setTitle("R.E.L.A.X.")
						.setIcon("curly-braces")
						.onClick(async () => this.addBrackets());
				});
			})
		);

		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				menu.addItem((item) => {
					item.setTitle("R.E.L.A.X.")
						.setIcon("curly-braces")
						.onClick(async () => this.addBrackets());
				});
				menu.addItem((item) => {
					item.setTitle("RELAX: Remove all brackets")
						.setIcon("curly-braces")
						.onClick(async () => this.removeBrackets());
				});
				menu.addItem((item) => {
					item.setTitle("RELAX: Blacklist selected links")
						.setIcon("curly-braces")
						.onClick(async () => this.addToBlacklist());
				});
			})
		);
	}

	async resetToDefaults() {
		this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
		await this.saveSettings();
	}

	async loadSettings() {
		const loadedSettings = await this.loadData();
		this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedSettings || {});
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	removeBracketsInSelection(content: string, sourcePath: string = ""): string {
		const regex = /(^|[^!])\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
		if (!this.settings.removeOnlyUnresolvedLinks) {
			return content.replace(regex, "$1$2");
		}
		return content.replace(regex, (match, prefix, linkText) => {
			const targetFile = this.app.metadataCache.getFirstLinkpathDest(linkText, sourcePath);
			return targetFile ? match : prefix + linkText;
		});
	}

	async addBracketsForFile(noteFilePath = "") {
		await this.processFileContent(noteFilePath, (content) => this.updateSelection(content, this.settings));
	}

	async removeBracketsinFile(noteFilePath = "") {
		await this.processFileContent(noteFilePath, (content, path) => this.removeBracketsInSelection(content, path));
	}

	async processFileContent(noteFilePath: string, contentProcessor: (content: string, sourcePath: string) => string, noteFile?: TFile): Promise<void> {
		if (!noteFile && noteFilePath !== "") {
			noteFile = this.app.vault.getAbstractFileByPath(noteFilePath) as TFile;
		} else if (!noteFile) {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			noteFile = view ? view.file : null;
		}

		if (!(noteFile instanceof TFile)) return;

		let fileContent = await this.app.vault.read(noteFile);
		const updatedContent = contentProcessor(fileContent, noteFile.path);

		if (fileContent !== updatedContent) {
			await this.app.vault.modify(noteFile, updatedContent);
		}
	}

	updateSelection(content: string, settings: RelaxPluginSettings): string {
		let codePlaceholders: string[] = [];
		if (settings.ignoreCodeBlocks) {
			content = content.replace(/```[\s\S]*?```/g, (match) => {
				codePlaceholders.push(match);
				return `__CODEBLOCK_PLACEHOLDER_${codePlaceholders.length - 1}__`;
			});
			content = content.replace(/`[^`]+`/g, (match) => {
				codePlaceholders.push(match);
				return `__CODEBLOCK_PLACEHOLDER_${codePlaceholders.length - 1}__`;
			});
		}

		let linkPlaceholders: string[] = [];
		if (settings.ignoreLinks) {
			content = content.replace(/\[\[.*?\]\]/g, (match) => {
				linkPlaceholders.push(match);
				return `__LINK_PLACEHOLDER_${linkPlaceholders.length - 1}__`;
			});
		}

		let urlPlaceholders: string[] = [];
		if (settings.ignoreURLs) {
			const urlRegex = /(https?:\/\/[^\s]+)/g;
			content = content.replace(urlRegex, (match) => {
				urlPlaceholders.push(match);
				return `__URL_PLACEHOLDER_${urlPlaceholders.length - 1}__`;
			});
		}

		if (settings.defangURLs) {
			const fangMap: Record<string, string> = { "[.]": ".", "[:]": ":" };
			content = content.replace(/\[\.\]|\[\:\]/g, char => fangMap[char]);
		}

		const activeRegexes: string[] = [];
		const extractRegexes = (nodes: RegexNode[]) => {
			if (!nodes) return;
			nodes.forEach(node => {
				if (node.isActive) {
					if (node.type === 'group' && node.items) extractRegexes(node.items);
					else if (node.type === 'regex' && node.regex) activeRegexes.push(node.regex);
				}
			});
		};
		extractRegexes(settings.regexItems || []);
		activeRegexes.forEach(regexStr => {
			try {
				const compiledRegex = new RegExp(regexStr, "g");
				content = content.replace(compiledRegex, (match, ...args) => {
					const offset = args[args.length - 2];
					const wholeString = args[args.length - 1];

					if (offset > 0 && wholeString[offset - 1] === '\\') return match;

					const target = (args.length > 2 && args[0] !== undefined) ? args[0] : match;
					if (settings.blacklist.includes(target)) return match;

					return match.replace(target, `[[${target}]]`);
				});
			} catch (e) {}
		});

		if (settings.ignoreURLs) {
			urlPlaceholders.forEach((url, i) => content = content.replace(`__URL_PLACEHOLDER_${i}__`, url));
		}
		if (settings.ignoreLinks) {
			linkPlaceholders.forEach((link, i) => content = content.replace(`__LINK_PLACEHOLDER_${i}__`, link));
		}
		if (settings.ignoreCodeBlocks) {
			codePlaceholders.forEach((block, i) => content = content.replace(`__CODEBLOCK_PLACEHOLDER_${i}__`, block));
		}

		return content;
	}

	async processMarkdownContent(action: "removeBrackets" | "addBrackets") {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) return;

		const selection = view.editor.getSelection();
		const sourcePath = view.file ? view.file.path : "";

		if (selection && selection.trim().length !== 0) {
			let updatedSelection = action === "removeBrackets" ? this.removeBracketsInSelection(selection, sourcePath) : this.updateSelection(selection, this.settings);
			view.editor.replaceSelection(updatedSelection);
		} else {
			if (action === "removeBrackets") await this.removeBracketsinFile();
			else await this.addBracketsForFile();
		}
	}

	async removeBrackets() {
		await this.processMarkdownContent("removeBrackets");
	}

	async addBrackets() {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (view) {
			const editor = view.editor;
			const selection = editor.getSelection();
			if (selection && selection.trim().length !== 0) {
				const updatedSelection = this.updateSelection(selection, this.settings);
				editor.replaceSelection(updatedSelection);
				return;
			} else {
				await this.addBracketsForFile(view.file?.path);
				return;
			}
		}

		const activeLeaf = this.app.workspace.activeLeaf;
		if (!activeLeaf || !activeLeaf.view || !(activeLeaf.view as any).fileItems) return;

		const fileItems = (activeLeaf.view as any).fileItems;
		let selectedFileItem = null;

		for (const key in fileItems) {
			if (Object.prototype.hasOwnProperty.call(fileItems, key)) {
				const item = fileItems[key];
				if (item.selfEl && item.selfEl.classList.contains("has-focus")) {
					selectedFileItem = item;
					break;
				}
			}
		}

		if (!selectedFileItem) return;

		if (selectedFileItem.collapsible) {
			await this.addBracketsForFolder(selectedFileItem.file.path);
		} else {
			await this.addBracketsForFile(selectedFileItem.file.path);
		}
	}

	async addBracketsForFolder(folderPath: string) {
		const files = this.app.vault.getMarkdownFiles().filter(file => file.path.startsWith(folderPath));
		for (let i = 0; i < files.length; i++) {
			await this.addBracketsForFile(files[i].path);
		}
	}

	async addToBlacklist() {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) return;

		const selection = view.editor.getSelection();
		if (selection && selection.trim().length !== 0) {
			const links = selection.match(/\[\[([^\]]+)\]\]/g);
			if (links) {
				let added = false;
				links.forEach(link => {
					const text = link.replace(/\[\[|\]\]/g, '');
					if (!this.settings.blacklist.includes(text)) {
						this.settings.blacklist.push(text);
						added = true;
					}
				});
				if(added) await this.saveSettings();
			}
		}
	}
}
