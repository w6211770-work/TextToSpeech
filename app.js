async function loadDefaultFile(){

    try{

        const response = await fetch("sample.csv");
        const text = await response.text();
		loadCsv(text);
		
		document.getElementById("startLine").max =
		    lines.length;
		
		statusEl.textContent =
		   `デフォルト読込完了 (${lines.length}件)`;

    }
    catch(error){

        statusEl.textContent =
            "デフォルトファイル読込失敗";

        console.error(error);

    }
}

let lines = [];

let currentIndex = 0;
let isReading = false;

const statusEl = document.getElementById("status");

let englishVoice = null;
let japaneseVoice = null;

function loadVoices() {

    const voices = speechSynthesis.getVoices();

    console.log("利用可能音声");

    voices.forEach(v => {
        console.log(v.name + " : " + v.lang);
    });

    // 英語音声優先
    englishVoice =
        voices.find(v =>
            v.name.includes("Google") &&
            v.lang.startsWith("en")
        ) ||
        voices.find(v =>
            v.lang === "en-US"
        ) ||
        voices.find(v =>
            v.lang.startsWith("en")
        );

    // 日本語音声
    japaneseVoice =
        voices.find(v =>
            v.lang === "ja-JP"
        ) ||
        voices.find(v =>
            v.lang.startsWith("ja")
        );

    console.log("英語音声:", englishVoice?.name);
    console.log("日本語音声:", japaneseVoice?.name);
}

// 音声一覧読込
loadVoices();
speechSynthesis.onvoiceschanged = loadVoices;




document
.getElementById("fileInput")
.addEventListener("change", async (e)=>{

    const file = e.target.files[0];

    if(!file){
        return;
    }

    const text = await file.text();

	loadCsv(text);
	
	document.getElementById("startLine").max =
	    lines.length;
	
	statusEl.textContent =
	    `ファイル読込完了 (${lines.length}件)`;

});



function loadCsv(text){

    const rows =
        text.split(/\r?\n/)
            .filter(v=>v.trim());

    lines = [];

    const startIndex =
        rows[0].includes("English") ||
        rows[0].includes("英語")
            ? 1
            : 0;

    for(let i=startIndex;i<rows.length;i++){

        const cols = rows[i].split(",");

		lines.push({
		    english : cols[0]?.trim() || "",
		    japanese : cols.slice(1).join(",").trim()
		});

    }

}

function speakPair(){
	
	if(currentIndex >= lines.length){
	
	    isReading = false;
	
	    statusEl.textContent =
	        "読み上げ完了";
	
	    return;
	}

    const row = lines[currentIndex];

	const displayText =
	    document.getElementById("displayText");
	
	displayText.textContent =
	    `${row.english} , ${row.japanese}`;
	

    const en =
        new SpeechSynthesisUtterance(
            row.english
        );

    en.lang = "en-US";
    en.voice = englishVoice;
	en.onend = () => {
 	   const ja =
	        new SpeechSynthesisUtterance(
	            row.japanese
	        );

	    ja.lang = "ja-JP";
	    ja.voice = japaneseVoice;
	
ja.onend = () => {

    currentIndex++;

    if(isReading){
        speakPair();
    }
};
	
	    speechSynthesis.speak(ja);
	};

    speechSynthesis.speak(en);

}

document
.getElementById("startBtn")
.addEventListener("click", ()=>{

    if(lines.length === 0){
        alert("CSVファイルを選択してください。");
        return;
    }

    if(isReading){
        return;
    }

	if(currentIndex === 0){
	
	    const startLine =
	        Number(
	            document.getElementById("startLine").value
	        );
	
	    currentIndex =
	        Math.max(
	            0,
	            Math.min(startLine - 1, lines.length - 1)
	        );
	}
	
	if(currentIndex >= lines.length){
	
	    isReading = false;
	    currentIndex = 0;
	
	    statusEl.textContent =
	        "読み上げ完了";
	
	    return;
	}

    isReading = true;

    statusEl.textContent =
        `${currentIndex + 1}行目から開始`;

    speakPair();
});


document
.getElementById("stopBtn")
.addEventListener("click", ()=>{

    isReading = false;

    speechSynthesis.cancel();

    statusEl.textContent =
        "停止";

});


loadDefaultFile();
