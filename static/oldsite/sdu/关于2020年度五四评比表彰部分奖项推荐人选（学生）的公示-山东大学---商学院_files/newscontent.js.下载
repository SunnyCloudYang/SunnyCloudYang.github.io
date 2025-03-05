/**
Obtain news content components of the vote
*/
var _newscontent_errcode = "";
var _newscontent_errorcode = "";
var _newscontent_votebgcolor = "";
var _newscontent_votetitlestyle = "";
var _newscontent_votefgcolor = "";
var _newscontent_qdimg = "";
var _newscontent_votestyle = "";
var _newscontent_Welcomevote = "";
var _newscontent_padding = "";
var _newscontent_toupiao = "";
var _newscontent_chakan = "";
var _newscontent_myform = "";
var _newscontent_writevote = "";
var _newscontent_owner = "";
var _newscontent_ip = "";
var _newscontent_newsid = "";
var _newscontent_againvote = "";
var _newscontent_errvote = "";
var _newscontent_thinksvote = "";
var _newscontent_voteresult = "";
function showVote(pnewsid,powner,pvotebgcolor,pvotetitlestyle,pvotefgcolor,pqdimg,pvotestyle,pWelcomevote,ppadding,ptoupiao,pchakan,pformname,pwritevote,pip,pagainvote,perrvote,pthinksvote,pvoteresult)
{
    _newscontent_votebgcolor = pvotebgcolor;
    _newscontent_votetitlestyle = pvotetitlestyle;
    _newscontent_votefgcolor = pvotefgcolor;
    _newscontent_qdimg = pqdimg;
    _newscontent_votestyle = pvotestyle;
    _newscontent_Welcomevote = pWelcomevote;
    _newscontent_padding = ppadding;
    _newscontent_toupiao = ptoupiao;
    _newscontent_chakan = pchakan;
    _newscontent_myform = pformname;
    _newscontent_writevote = pwritevote;
    _newscontent_owner = powner;
    _newscontent_ip = pip;
    _newscontent_newsid = pnewsid;
    _newscontent_againvote = pagainvote;
    _newscontent_errvote = perrvote;
    _newscontent_thinksvote = pthinksvote;
    _newscontent_voteresult = pvoteresult;
    NewsvoteDWR.getVoteTitle(pnewsid,powner,_newscontent_puttitle);
}
function _newscontent_puttitle(title)
{
    if(title.result == "true")
    {
        var vote = "<div  style='border:1px solid #cffcff;_newscontent_padding:4px;background-color:"+_newscontent_votebgcolor+";width:100%'>"
        vote += "<table width='100%' align='center' " + _newscontent_votetitlestyle + ">";
        vote += "<div style='_newscontent_padding:5px;border-bottom:1px dashed " + _newscontent_votefgcolor + ";margin:5px 5px 5px 5px;'>" + _newscontent_qdimg + "<span " + _newscontent_votestyle + ">&nbsp;&nbsp;" + _newscontent_Welcomevote + "</span></div>"
        for(i=0; i<title.titlelist.length;i++)
        {
            var type = "radio";
            var checked = "checked";
            if(title.radiolist[i]==1)
            {
                type = "checkbox";
                checked = "";
            }
            vote += "<tr>";
            vote += "<td  title='"+title.captionlist[i]+"' colspan=4 height=100% " + _newscontent_votetitlestyle + ">";
            vote += title.titlelist[i];
            vote += "</td>";
            vote += "</tr>";
            for(j = 0;j< title.option[i].optitlelist.length;j++)
            {
                if(j != 0)
                    checked = "";
                vote += "<tr>";
                vote += "<td style='_newscontent_padding-left:" + _newscontent_padding + "px'  title='"+ title.option[i].optitlelist[j]+ "' colspan=4 height=100% " + _newscontent_votetitlestyle + ">";
                vote += "<input type="+ type +" name='vote"+ type+ title.titleidlist[i] +"' "+ checked +" value="+ title.option[i].opidlist[j] +"> "
                vote += title.option[i].optitlelist[j];
                vote += "</td>";
                vote += "</tr>";
            }
        }
        vote += "<tr>"
        vote += "<td align='center'>"
        vote += _newscontent_toupiao;
        vote += "   "+_newscontent_chakan;
        vote += "</td>"
        vote += "</tr>"
        vote += "</table>";
        vote += "</div>"
        document.getElementById("div_vote_id").innerHTML = vote;
    }
    else
    {
    }
}
function _newscontent_getresult(_newscontent_newsid,_newscontent_owner)
{
    var hascheck =false;
    var ischeck = false;
    for(var i = 0; i < _newscontent_myform.elements.length; i++)
    {
        var item = _newscontent_myform.elements[i];

        if(item.tagName == "INPUT"  )
        {
            if(item.type.toLowerCase()=="checkbox")
            {
                hascheck = true;
                var checkboxvalues = document.getElementsByName(item.name);
                for(var j=0;j<checkboxvalues.length; j++)
                {
                    if(checkboxvalues[j].checked )
                    {
                        ischeck = true;
                        break;
                    }
                }
            }
        }
    }
    if(!ischeck && hascheck)
    {
        alert(_newscontent_writevote);
        return false;
    }
    NewsvoteDWR.isVote(_newscontent_newsid,_newscontent_owner,_newscontent_ip,_newscontent_isvote);
}
function _newscontent_isvote(result)
{
    if(result)
    {
        NewsvoteDWR.getVoteTitle(_newscontent_newsid,_newscontent_owner,_newscontent_setoption);
    }
    else
    {
        alert(_newscontent_againvote);
    }
}
function _newscontent_lookresult()
{
    NewsvoteDWR.getResult(_newscontent_newsid,_newscontent_owner,_newscontent_putresult);
}
function _newscontent_setoption(result)
{
    for(i=0; i<result.titlelist.length;i++)
    {
        if(result.radiolist[i]==0)
        {
            NewsvoteDWR.save(result.titleidlist[i],_newscontent_owner,_newscontnent_checkRadioValue("voteradio" + result.titleidlist[i]),_newscontent_ip,_newscontent_seterror);
        }
        if(result.radiolist[i]==1)
        {
            var item = document.getElementsByName("votecheckbox"+result.titleidlist[i]);
            for(j = 0;j< result.option[i].optitlelist.length;j++)
            {
                if(item[j].checked)
                NewsvoteDWR.save(result.titleidlist[i],_newscontent_owner,item[j].value,_newscontent_ip,_newscontent_seterror);
            }
        }
    }
    _newscontent_geterror();
}
function _newscontent_seterror(error)
{
    if(error=="")
        _newscontent_errorcode = _newscontent_errvote;
    _newscontent_errcode = error;
}
function _newscontent_geterror()
{
    if(_newscontent_errorcode!="")
        alert(_newscontent_errorcode);
    else
        alert(_newscontent_thinksvote);
    NewsvoteDWR.getResult(_newscontent_newsid,_newscontent_owner,_newscontent_putresult);
}
function _newscontent_putresult(title)
{
    if(title.result == "true")
    {
        var vote = "<div style='border:1px solid #cffcff;_newscontent_padding:4px;background-color:#F9F9F9;width:100%'>"
        vote += "<table width='100%' align='center' " + _newscontent_votetitlestyle + ">";
        vote += "<div style='_newscontent_padding:5px;border-bottom:1px dashed #222222;margin:5px 5px 5px 5px;'>" + _newscontent_qdimg + "<span " + _newscontent_votestyle + ">&nbsp;&nbsp;" + _newscontent_voteresult + "</span></div>"
        for(i=0; i<title.titlelist.length;i++)
        {
            vote += "<tr>";
            vote += "<td  title='"+title.captionlist[i]+"' " + _newscontent_votetitlestyle + ">";
            vote += title.titlelist[i];
            vote += "</td>";
            vote += "</tr>";
            for(j = 0;j< title.option[i].optitlelist.length;j++)
            {
                vote += "<tr>";
                vote += "<td style='_newscontent_padding-left:" + _newscontent_padding + "px'  title='"+ title.option[i].optitlelist[j]+ "' width='60%' " + _newscontent_votetitlestyle + ">";
                vote += title.option[i].optitlelist[j];
                vote += "</td>";
                vote += "</tr>";
                vote += "<tr>"
                vote += "<td>"
                vote += "<div class='process'>"
                vote += "<div class='style7' style='width:"+ title.option[i].opnumlist[j] +"'></div></div>"
                vote += title.option[i].opchecklist[j]+"("+ title.option[i].opnumlist[j] +")";
                vote += "</td>"
                vote += "</tr>";
            }
        }
        vote += "</table>";
        vote += "</div>"
        document.getElementById("div_vote_id").innerHTML = vote;
    }
    else
    {
        alert(_newscontent_errvote);
    }
}

function _newscontnent_checkRadioValue(keystr)
{
    var keyname = keystr;
    var obj = document.getElementsByName(keyname);
    
    var flag = false;
    var i = 0;

    if(obj == null)
    {
        return "";
    }

    if(obj.length == null)
    {
        if(obj.checked)
        {
            return obj.value;
        }
    }
    for(i = 0; i < obj.length; i++)
    {
        if(obj[i].checked)
        {
            return obj[i].value;
            break;
        }
    }

    return "";
}

function shareto(a,U,T,S,key)  
{
    var ec = encodeURIComponent,
    A = '/system/resource/news/weiboshare.htm';
    
   	var C = '?type=' + a + '&url=' + ec(U || document.location) + '&title=' + ec(T) + (S ? '&summary=' + S : '')+(key ? '&appkey=' + key : '');
   	if(a=='tsohu')
   	   C = '?type=' + a + '&url=' + ec(U || document.location) + '&title=' + T + (S ? '&summary=' + S : '')+(key ? '&appkey=' + key : '');
    try 
    {
        window.open(A + C, '');
    } catch (e) 
    {
    }
    return false;
}


function download_news(contentid,treeid,owner,newsid)
{
    if(checkobj_content(contentid))
    {
        if(confirm('文章含有word中无法显示内容，下载后可能无法正常显示。是否继续下载？'))
        {
            location.href='/system/resource/news/newstoword.jsp?treeid='+treeid+'&owner='+owner+'&wbnewsid='+newsid;
        }
    }else{
        location.href='/system/resource/news/newstoword.jsp?treeid='+treeid+'&owner='+owner+'&wbnewsid='+newsid;
    }
}

function checkobj_content(contentid)
{
   if(getContentTags(contentid))
   {
       return true;
   }
   return false;
}

function getContentTags(contentid)
{
	var current;
	var contentNode = document.getElementById(contentid).innerHTML;
	var regex = /<object|OBJECT|iframe|IFRAME|embed|EMBED[^>/]*>(.*?)<\/object|OBJECT|iframe|IFRAME|embed|EMBED>/i;
	var groups = regex.exec(contentNode);
	if(groups){
		return true;
	}
	return false;
}

function show_vsb_content_tips(buttonObj,conentid)
{
    buttonObj.style.display="none";
    var o=document.getElementById(conentid);
    o.style.display="";
}
//正文中输出mp3播放代码 
function showVsbAudio(aurl,vheight,vwidth,align,styles,vautoplay)
{
	if(aurl=="")
	{
	    return;   
	}
	var playersrc = "/system/resource/images/ueditor/musicFlash/player_mp3_maxi.swf";
	var flashvars = "mp3="+aurl+"&showstop=1&showvolume=1&bgcolor1=eeeeee&bgcolor2=a0a0a0";
	var autoplayStr = "";
	if(vautoplay=="true")
	{
	        autoplayStr = "autoplay = 'true'";
	        flashvars +="&autoplay=1";
    }
	var outputHTML="";
	outputHTML +='<audio src="'+aurl+'" width="'+vwidth+'" height="'+vheight+'"  '+autoplayStr+' align="'+align+'" style="'+styles+'"  controls="controls"><embed align="'+align+'" style="'+styles+'" width="'+vwidth+'" height="'+vheight+'" src="'+playersrc+'" flashvars="'+flashvars+'" /></audio>';
	document.write(outputHTML);
}