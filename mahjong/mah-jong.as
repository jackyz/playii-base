stopAllSounds();
setProperty("renn" + ndd, _visible, 1);
setProperty("renn" + ndd, _xscale, 20);
setProperty("renn" + ndd, _yscale, 20);
setProperty("renn" + ndd, _x, 420);
setProperty("renn" + ndd, _y, 320);
hcs = 0;
sound = 0;
j_df = 1;
d_df = 1;
ll = 21;
nd = (5 - ndd) * 12 + ll + int(random(500) / 100);
dui_tp = int(random(1500) / 100);
setProperty("d_ting", _visible, 0);
setProperty("j_ting", _visible, 0);
setProperty("defen", _visible, 0);
setProperty("flag", _visible, 0);
setProperty("black", _visible, 0);
setProperty("blue", _visible, 0);
setProperty("zhahu", _visible, 0);
setProperty("zhahu1", _visible, 0);
setProperty("zhating", _visible, 0);
_root.defen.de_fen = 0;
for (i = 0; i <= 16; i = i + 1)
{
    hu = "h-" + String(i);
    setProperty(hu, _visible, 0);
} // end of for
setProperty("dui_14", _visible, 0);
setProperty("dui_13", _visible, 1);
setProperty("chi_3", _visible, 0);
setProperty("chi_21", _visible, 0);
setProperty("chi_22", _visible, 0);
gc = 0;
fan = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
ch_bz = 0;
p3 = new Array();
cpg = new Array();
mgang = new Array();
agang = new Array();
zzz = 0;
ggg = 0;
ggpai = new Array();
chi_peng = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
if (zhuang == 0)
{
    zhuang = 1;
}
else
{
    zhuang = 0;
} // end if
ppp = 0;
chipai = new Array();
ppai = new Array();
cp = new Array();
chi = 0;
chi1 = 0;
h_bz = 0;
zhua = 0;
dx = dr = 20;
dy = 100;
ds = 17;
dt = 24;
ting_bz = 0;
ting_bz1 = 0;
ting_bz2 = 0;
pll = new Array();
pnn = new Array();
pok = new Array();
dui_zhua = new Array();
dfan = new Array(0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
suiji = 2250 - (ndd - 1) * 100;
dui_zhua = dfpai(suiji);
dui_hp = new Array();
di = dui_zhua.shift();
for (i = 0; di - 1 >= i; i = i + 1)
{
    dui_hp[i] = dui_zhua.shift();
} // end of for
pokk = new Array();
pokk = seek(dui_zhua, pl);
pok = shuffle(pokk);
zps = pok.length - 1;
zhuapai = new Array();
for (rz = 0; rz <= 12; rz = rz + 1)
{
    zhuapai[rz] = pok[rz];
    String(zhuapai[rz]).duplicateMovieClip(String(rz), rz);
} // end of for
setProperty("back2", _visible, 0);
(x = 26, y = 272, skip = 29);
for (i = 0; i <= 12; i = i + 1)
{
    setProperty(String(i), _x, x + skip * i);
    setProperty(String(i), _y, y);
} // end of for


function tingpai(array1)
{
    var arr0 = new Array();
    var arr1 = new Array();
    var arr2 = new Array();
    var arr3 = new Array();
    var t0 = new Array();
    var t1 = new Array();
    var t2 = new Array();
    var t3 = new Array();
    var tt0 = 0;
    var tt1 = 0;
    var tt2 = 0;
    var tt3 = 0;
    var ar = new Array();
    var ard = new Array();
    ar = ar.concat(array1);
    ard = ard.concat(array1);
    ard = chu2dui(ard);
    var ting = 0;
    if (ard.length == 1 && cpg.length == 0)
    {
        ting = 1;
    }
    else
    {
        fenpai(ar);
        arr0 = arr0.concat(fp1);
        arr1 = arr1.concat(fp2);
        arr2 = arr2.concat(fp3);
        arr3 = arr3.concat(fp4);
        var len = new Array(arr0.length, arr1.length, arr2.length, arr3.length);
        var len0 = new Array();
        var len1 = new Array();
        var len2 = new Array();
        var i = 0;
        while (len.length - 1 >= i)
        {
            if (len[i] != 0)
            {
                eval("len" + len[i] % 3).push(len[i] % 3);
            } // end if
            i = i + 1;
        } // end while
        if (len1.length == 1 && len2.length == 0 || len2.length == 2 && len1.length == 0)
        {
            for (i = 0; i <= 3; i = i + 1)
            {
                if (len[i] == 0)
                {
                    i = i + 1;
                    continue;
                } // end if
                if (len[i] % 3 == 0)
                {
                    eval("t" + i) = ht1(eval("arr" + i));
                    if (eval("t" + i).length == 0)
                    {
                        eval("tt" + i) = 1;
                    }
                    else
                    {
                        eval("t" + i) = chu3dui(eval("arr" + i));
                        eval("t" + i) = chushun(eval("t" + i));
                        if (eval("t" + i).length == 0)
                        {
                            eval("tt" + i) = 1;
                        } // end if
                    } // end if
                } // end if
                if (len[i] % 3 == 1)
                {
                    var j = 0;
                    var k = 0;
                    while (len[i] - 1 >= j)
                    {
                        if (k != eval("arr" + i)[0])
                        {
                            eval("t" + i) = ht1(eval("arr" + i));
                            eval("t" + i) = chudui(eval("t" + i));
                            k = eval("arr" + i).shift();
                            eval("arr" + i).push(k);
                            if (eval("t" + i).length == 1)
                            {
                                j = len[i];
                                eval("tt" + i) = 1;
                            }
                            else if (eval("t" + i).length == 2 && Math.abs(eval("t" + i)[1] - (eval("t" + i)[0])) <= 2)
                            {
                                if (eval("t" + i)[0] < 400)
                                {
                                    j = len[i];
                                    eval("tt" + i) = 1;
                                }
                                else if (eval("t" + i)[0] == eval("t" + i)[1])
                                {
                                    j = len[i];
                                    eval("tt" + i) = 1;
                                }
                                else
                                {
                                    j = j + 1;
                                } // end if
                            }
                            else
                            {
                                j = j + 1;
                            } // end if
                        }
                        else
                        {
                            k = eval("arr" + i).shift();
                            eval("arr" + i).push(k);
                            j = j + 1;
                        } // end if
                        if (l >= 7)
                        {
                            j = len[i];
                        } // end if
                    } // end while
                } // end if
                if (len[i] % 3 == 2)
                {
                    eval("t" + i) = chu3dui(eval("arr" + i));
                    eval("t" + i) = chushun(eval("t" + i));
                    eval("t" + i) = chudui(eval("t" + i));
                    if (eval("t" + i).length == 2 && Math.abs(eval("t" + i)[1] - (eval("t" + i)[0])) <= 2)
                    {
                        if (eval("t" + i)[0] < 400)
                        {
                            j = len[i];
                            eval("tt" + i) = 1;
                        }
                        else if (eval("t" + i)[0] == eval("t" + i)[1])
                        {
                            j = len[i];
                            eval("tt" + i) = 1;
                        } // end if
                    } // end if
                    if (eval("tt" + i) != 1)
                    {
                        var j = 0;
                        var k = 0;
                        while (len[i] - 1 >= j)
                        {
                            if (k != eval("arr" + i)[0])
                            {
                                eval("t" + i) = ht1(eval("arr" + i));
                                k = eval("arr" + i).shift();
                                eval("arr" + i).push(k);
                                if (eval("t" + i).length == 2 && Math.abs(eval("t" + i)[1] - (eval("t" + i)[0])) <= 2)
                                {
                                    if (eval("t" + i)[0] < 400)
                                    {
                                        j = len[i];
                                        eval("tt" + i) = 1;
                                    }
                                    else if (eval("t" + i)[0] == eval("t" + i)[1])
                                    {
                                        j = len[i];
                                        eval("tt" + i) = 1;
                                    }
                                    else
                                    {
                                        j = j + 1;
                                    } // end if
                                }
                                else
                                {
                                    j = j + 1;
                                } // end if
                            }
                            else
                            {
                                k = eval("arr" + i).shift();
                                eval("arr" + i).push(k);
                                j = j + 1;
                            } // end if
                            if (l >= 7)
                            {
                                j = len[i];
                            } // end if
                        } // end while
                    } // end if
                } // end if
                if (eval("tt" + i) != 1)
                {
                    i = 4;
                    continue;
                } // end if
            } // end of for
        }
        else
        {
            ting = 0;
        } // end if
        var j1 = 0;
        var j2 = 0;
        for (i = 0; i <= 3; i = i + 1)
        {
            if (len[i] != 0)
            {
                j1 = j1 + 1;
            } // end if
            if (eval("tt" + i) != 0)
            {
                j2 = j2 + 1;
            } // end if
        } // end of for
        if (j1 > 0 && j1 == j2)
        {
            ting = 1;
        } // end if
    } // end if
    return(ting);
} // End of the function
function hupai(array1)
{
    var arr0 = new Array();
    var arr1 = new Array();
    var arr2 = new Array();
    var arr3 = new Array();
    var t0 = new Array();
    var t1 = new Array();
    var t2 = new Array();
    var t3 = new Array();
    var tt0 = 0;
    var tt1 = 0;
    var tt2 = 0;
    var tt3 = 0;
    var ar = new Array();
    ar = ar.concat(array1);
    ar.sort();
    var ard = new Array();
    ard = ard.concat(array1);
    var hu = 0;
    ard = chu2dui(ard);
    if (ard.length == 0 && cpg.length == 0)
    {
        hu = 2;
        ard = ard.concat(array1);
        ard.sort();
        var i = 0;
        while (ard.length - 4 >= i)
        {
            if (ard[i] == ard[i + 3])
            {
                hu = 3;
                i = 15;
            } // end if
            i = i + 2;
        } // end while
    }
    else
    {
        fenpai(ar);
        arr0 = arr0.concat(fp1);
        arr1 = arr1.concat(fp2);
        arr2 = arr2.concat(fp3);
        arr3 = arr3.concat(fp4);
        var len = new Array(arr0.length, arr1.length, arr2.length, arr3.length);
        var len0 = new Array();
        var len1 = new Array();
        var len2 = new Array();
        var i = 0;
        while (len.length - 1 >= i)
        {
            if (len[i] != 0)
            {
                eval("len" + len[i] % 3).push(len[i] % 3);
            } // end if
            i = i + 1;
        } // end while
        if (len1.length != 0 || len2.length >= 2)
        {
            hu = 0;
        }
        else
        {
            for (i = 0; i <= 3; i = i + 1)
            {
                if (len[i] == 0)
                {
                    i = i + 1;
                    continue;
                } // end if
                if (len[i] % 3 == 0)
                {
                    eval("t" + i) = ht1(eval("arr" + i));
                    if (eval("t" + i).length == 0)
                    {
                        eval("tt" + i) = 1;
                    }
                    else
                    {
                        eval("t" + i) = chu3dui(eval("arr" + i));
                        eval("t" + i) = chushun(eval("t" + i));
                        if (eval("t" + i).length == 0)
                        {
                            eval("tt" + i) = 1;
                        } // end if
                    } // end if
                } // end if
                if (len[i] % 3 == 2)
                {
                    eval("t" + i) = chu3dui(eval("arr" + i));
                    eval("t" + i) = chushun(eval("t" + i));
                    eval("t" + i) = chudui(eval("t" + i));
                    if (eval("t" + i).length == 0)
                    {
                        eval("tt" + i) = 1;
                    } // end if
                    if (eval("tt" + i) != 1)
                    {
                        var j = 0;
                        var k = 0;
                        var l = 0;
                        while (len[i] - 1 >= j)
                        {
                            if (k != eval("arr" + i)[0])
                            {
                                l = l + 1;
                                eval("t" + i) = ht1(eval("arr" + i));
                                k = eval("arr" + i).shift();
                                eval("arr" + i).push(k);
                                eval("t" + i) = chudui(eval("t" + i));
                                if (eval("t" + i).length == 0)
                                {
                                    j = len[i];
                                    eval("tt" + i) = 1;
                                }
                                else
                                {
                                    j = j + 1;
                                } // end if
                            }
                            else
                            {
                                k = eval("arr" + i).shift();
                                eval("arr" + i).push(k);
                                j = j + 1;
                            } // end if
                            if (l >= 7)
                            {
                                j = len[i];
                            } // end if
                        } // end while
                    } // end if
                } // end if
                if (eval("tt" + i) != 1)
                {
                    i = 4;
                    continue;
                } // end if
            } // end of for
        } // end if
        var j1 = 0;
        var j2 = 0;
        for (i = 0; i <= 3; i = i + 1)
        {
            if (len[i] != 0)
            {
                j1 = j1 + 1;
            } // end if
            if (eval("tt" + i) != 0)
            {
                j2 = j2 + 1;
            } // end if
        } // end of for
        if (j1 > 0 && j1 == j2)
        {
            hu = 1;
        } // end if
    } // end if
    return(hu);
} // End of the function
function seek(array1, array2)
{
    var ar1 = new Array();
    var ar2 = new Array();
    ar1 = ar1.concat(array1);
    ar2 = ar2.concat(array2);
    ar1.sort();
    sss = 0;
    var ti = 0;
    var ls = new Array();
    while (ar1.length - 1 >= ti)
    {
        var tj = 0;
        while (ar2.length - 1 >= tj)
        {
            if (ar1[ti] == ar2[tj])
            {
                ls.push(ar2[tj]);
                ar2.splice(tj, 1);
                tj = ar2.length;
                sss = tj;
                continue;
            } // end if
            tj = tj + 1;
        } // end while
        ti = ti + 1;
    } // end while
    if (ls.length != ar1.length)
    {
        ar2 = new Array();
        ar2 = ar2.concat(array2);
    } // end if
    return(ar2);
} // End of the function
function seek1(array1, array2)
{
    var ar1 = new Array();
    var ar2 = new Array();
    ar1 = ar1.concat(array1);
    ar2 = ar2.concat(array2);
    var ti = 0;
    var ls = new Array();
    while (ar1.length - 1 >= ti)
    {
        var tj = 0;
        while (ar2.length - 1 >= tj)
        {
            if (ar1[ti] == ar2[tj])
            {
                ls.push(ar2[tj]);
                ar2.splice(tj, 1);
                tj = ar2.length;
                continue;
            } // end if
            tj = tj + 1;
        } // end while
        ti = ti + 1;
    } // end while
    return(ls);
} // End of the function
function shuffle(array1)
{
    var ar1 = new Array();
    var ar2 = new Array();
    var ar3 = new Array();
    var ar4 = new Array();
    if (array1.length != 0)
    {
        ar1 = ar1.concat(array1);
        var i = 0;
        while (ar1.length - 1 >= i)
        {
            var ran = Math.random();
            ar2[i] = ran;
            ar3[i] = ran;
            i = i + 1;
        } // end while
        ar3.sort();
        for (i = 0; ar3.length - 1 >= i; i = i + 1)
        {
            var j = 0;
            while (ar2.length - 1 >= j)
            {
                if (ar3[i] == ar2[j])
                {
                    ar4.push(ar1[j]);
                    ar2[j] = 100;
                    j = ar2.length;
                    continue;
                } // end if
                j = j + 1;
            } // end while
        } // end of for
        return(ar4);
    }
    else
    {
        return(array1);
    } // end if
} // End of the function
function fenpai(array1)
{
    fp1 = new Array();
    fp2 = new Array();
    fp3 = new Array();
    fp4 = new Array();
    var ar = new Array();
    ar = ar.concat(array1);
    var i = 0;
    while (ar.length - 1 >= i)
    {
        eval("fp" + int(ar[i] / 100)).push(ar[i]);
        i = i + 1;
    } // end while
} // End of the function
function ytl(array1)
{
    var arr = new Array();
    var ffp1 = new Array();
    var ffp2 = new Array();
    var ffp3 = new Array();
    var ffp4 = new Array();
    var ar = new Array();
    ar = ar.concat(array1);
    var i = 0;
    while (ar.length - 1 >= i)
    {
        eval("ffp" + int(ar[i] / 100)).push(ar[i]);
        i = i + 1;
    } // end while
    for (i = 1; i <= 4; i = i + 1)
    {
        if (eval("ffp" + i).length >= 9)
        {
            arr = arr.concat(eval("ffp" + i));
            i = 5;
            continue;
        } // end if
    } // end of for
    return(arr);
} // End of the function
function ht1(array1)
{
    var ar = new Array();
    var ar1 = new Array();
    var ar2 = new Array();
    ar = ar.concat(array1);
    var i = 0;
    var k = 0;
    var j = ar.length - 1;
    while (j >= i && ar.length != 0)
    {
        if (ar[i] > 400)
        {
            i = i + 1;
            continue;
        } // end if
        if (ar[i] == k)
        {
            i = i + 1;
            continue;
        } // end if
        ar1[0] = ar[i];
        ar1[1] = ar[i] + 1;
        ar1[2] = ar[i] + 2;
        ar2 = seek(ar1, ar);
        if (ar2.length != ar.length)
        {
            ar = new Array();
            ar = ar.concat(ar2);
            i = 0;
            k = 0;
            j = j - 3;
            continue;
        } // end if
        k = ar[i];
        i = i + 1;
    } // end while
    i = 0;
    j = ar.length - 1;
    while (j >= i && ar.length != 0)
    {
        ar1[0] = ar[i];
        ar1[1] = ar[i];
        ar1[2] = ar[i];
        ar2 = seek(ar1, ar);
        if (ar2.length != ar.length)
        {
            var ar = new Array();
            ar = ar.concat(ar2);
            i = 0;
            j = j - 3;
            continue;
        } // end if
        i = i + 1;
    } // end while
    return(ar);
} // End of the function
function ht2(array1)
{
    var ar = new Array();
    var ar1 = new Array();
    var ar2 = new Array();
    ar = ar.concat(array1);
    var i = 0;
    var j = ar.length - 1;
    while (j >= i && ar.length != 0)
    {
        ar1[0] = ar[i];
        ar1[1] = ar[i];
        ar1[2] = ar[i];
        ar2 = seek(ar1, ar);
        if (ar2.length != ar.length)
        {
            var ar = new Array();
            ar = ar.concat(ar2);
            i = 0;
            j = j - 3;
            continue;
        } // end if
        i = i + 1;
    } // end while
    i = 0;
    var k = 0;
    j = ar.length - 1;
    while (j >= i && ar.length != 0)
    {
        if (ar[i] > 400)
        {
            i = i + 1;
            continue;
        } // end if
        if (ar[i] == k)
        {
            i = i + 1;
            continue;
        } // end if
        ar1[0] = ar[i];
        ar1[1] = ar[i] + 1;
        ar1[2] = ar[i] + 2;
        ar2 = seek(ar1, ar);
        if (ar2.length != ar.length)
        {
            ar = new Array();
            ar = ar.concat(ar2);
            i = 0;
            k = 0;
            j = j - 3;
            continue;
        } // end if
        k = ar[i];
        i = i + 1;
    } // end while
    return(ar);
} // End of the function
function ht3(array1)
{
    var ar = new Array();
    var ar1 = new Array();
    var ar2 = new Array();
    ar = ar.concat(array1);
    ar.sort();
    ar.reverse();
    var i = 0;
    var j = ar.length - 1;
    while (j >= i && ar.length != 0)
    {
        if (ar[i] > 400)
        {
            i = i + 1;
            continue;
        } // end if
        ar1[0] = ar[i];
        ar1[1] = ar[i] - 1;
        ar1[2] = ar[i] - 2;
        ar2 = seek(ar1, ar);
        if (ar2.length != ar.length)
        {
            ar = new Array();
            ar = ar.concat(ar2);
            i = 0;
            j = j - 3;
            continue;
        } // end if
        i = i + 1;
    } // end while
    i = 0;
    j = ar.length - 1;
    while (j >= i && ar.length != 0)
    {
        ar1[0] = ar[i];
        ar1[1] = ar[i];
        ar1[2] = ar[i];
        ar2 = seek(ar1, ar);
        if (ar2.length != ar.length)
        {
            var ar = new Array();
            ar = ar.concat(ar2);
            i = 0;
            j = j - 3;
            continue;
        } // end if
        i = i + 1;
    } // end while
    return(ar);
} // End of the function
function ht4(array1)
{
    var ar = new Array();
    var ar1 = new Array();
    var ar2 = new Array();
    ar = ar.concat(array1);
    ar.sort();
    ar.reverse();
    var i = 0;
    var j = ar.length - 1;
    while (j >= i && ar.length != 0)
    {
        ar1[0] = ar[i];
        ar1[1] = ar[i];
        ar1[2] = ar[i];
        ar2 = seek(ar1, ar);
        if (ar2.length != ar.length)
        {
            var ar = new Array();
            ar = ar.concat(ar2);
            i = 0;
            j = j - 3;
            continue;
        } // end if
        i = i + 1;
    } // end while
    i = 0;
    j = ar.length - 1;
    while (j >= i && ar.length != 0)
    {
        if (ar[i] > 400)
        {
            i = i + 1;
            continue;
        } // end if
        ar1[0] = ar[i];
        ar1[1] = ar[i] - 1;
        ar1[2] = ar[i] - 2;
        ar2 = seek(ar1, ar);
        if (ar2.length != ar.length)
        {
            ar = new Array();
            ar = ar.concat(ar2);
            i = 0;
            j = j - 3;
            continue;
        } // end if
        i = i + 1;
    } // end while
    return(ar);
} // End of the function
function chushun(array1)
{
    var ar = new Array();
    var ar1 = new Array();
    var ar2 = new Array();
    ar = ar.concat(array1);
    var i = 0;
    var k = 0;
    var j = ar.length - 1;
    while (j >= i && ar.length != 0)
    {
        if (ar[i] > 400)
        {
            i = i + 1;
            continue;
        } // end if
        if (ar[i] == k)
        {
            i = i + 1;
            continue;
        } // end if
        ar1[0] = ar[i];
        ar1[1] = ar[i] + 1;
        ar1[2] = ar[i] + 2;
        ar2 = seek(ar1, ar);
        if (ar2.length != ar.length)
        {
            ar = new Array();
            ar = ar.concat(ar2);
            i = 0;
            k = 0;
            j = j - 3;
            continue;
        } // end if
        k = ar[i];
        i = i + 1;
    } // end while
    return(ar);
} // End of the function
function chudui(array1)
{
    var ar = new Array();
    var ar1 = new Array();
    ar = ar.concat(array1);
    ar.sort();
    var i = 0;
    var j = 0;
    while (ar.length - 1 >= i)
    {
        if (ar[i] == ar[i + 1])
        {
            j = i;
            i = ar.length;
            ar.splice(j, 2);
            continue;
        } // end if
        i = i + 1;
    } // end while
    return(ar);
} // End of the function
function chu3dui(array1)
{
    var ar = new Array();
    var ar1 = new Array();
    ar = ar.concat(array1);
    ar.sort();
    var i = 0;
    while (ar.length - 3 >= i)
    {
        if (ar[i] == ar[i + 2])
        {
            ar.splice(i, 3);
            i = 0;
            continue;
        } // end if
        i = i + 1;
    } // end while
    return(ar);
} // End of the function
function chu2dui(array1)
{
    var ar = new Array();
    var ar1 = new Array();
    ar = ar.concat(array1);
    ar.sort();
    var i = 0;
    while (ar.length - 2 >= i)
    {
        if (ar[i] == ar[i + 1])
        {
            ar.splice(i, 2);
            i = 0;
            continue;
        } // end if
        i = i + 1;
    } // end while
    return(ar);
} // End of the function
function dfpai1()
{
    var w = new Array(101, 102, 103, 104, 105, 106, 107, 108, 109);
    var b = new Array(201, 202, 203, 204, 205, 206, 207, 208, 209);
    var t = new Array(301, 302, 303, 304, 305, 306, 307, 308, 309);
    var z = new Array(401, 402, 403, 404, 405, 406, 407);
    var ar = new Array();
    var d = 400 + int(random(69) / 10) + 1;
    var r = random(69) + 1;
    var i = 0;
    for (r = int(r / 10); i <= 2; r = r + 1)
    {
        ar.push(w[r]);
        i = i + 1;
    } // end of for
    var r = random(69) + 1;
    var i = 0;
    for (r = int(r / 10); i <= 2; r = r + 1)
    {
        ar.push(b[r]);
        i = i + 1;
    } // end of for
    var r = random(69) + 1;
    var i = 0;
    for (r = int(r / 10); i <= 2; r = r + 1)
    {
        ar.push(t[r]);
        i = i + 1;
    } // end of for
    var ran = int(random(39) / 10);
    if (ran == 0)
    {
        var r = random(69) + 1;
        var i = 0;
        for (r = int(r / 10); i <= 2; r = r + 1)
        {
            ar.push(w[r]);
            i = i + 1;
        } // end of for
    } // end if
    if (ran == 1)
    {
        var r = random(69) + 1;
        var i = 0;
        for (r = int(r / 10); i <= 2; r = r + 1)
        {
            ar.push(b[r]);
            i = i + 1;
        } // end of for
    } // end if
    if (ran == 2)
    {
        var r = random(69) + 1;
        var i = 0;
        for (r = int(r / 10); i <= 2; r = r + 1)
        {
            ar.push(t[r]);
            i = i + 1;
        } // end of for
    } // end if
    if (ran == 3)
    {
        var r = random(69) + 1;
        var i = 0;
        r = int(r / 10);
        while (i <= 2)
        {
            ar.push(z[r]);
            i = i + 1;
        } // end while
        if (r <= 5)
        {
            d = z[r + 1];
        }
        else
        {
            d = z[0];
        } // end if
    } // end if
    var ran = (int(random(399) / 100) + 1) * 100 + int(random(89) / 10) + 1;
    if (ran > 400)
    {
        var dd = d;
        ar.push(d, d);
    }
    else
    {
        ar.push(ran, ran);
        var dd = ran;
    } // end if
    var t = new Array();
    var ran = 3 * int(random(399) / 100);
    if (ran >= 0 && ran <= 6)
    {
        if (ar[ran] % 100 <= 6)
        {
            t[0] = 2;
            t[1] = ar[ran];
            t[2] = ar[ran] + 3;
            ar.splice(ran, 1);
            ar = t.concat(ar);
        }
        else
        {
            t[0] = 1;
            t[1] = ar[ran];
            ar.splice(ran, 1);
            ar = t.concat(ar);
        } // end if
    }
    else if (ar[ran] % 100 <= 6 && ar[ran] < 400)
    {
        t[0] = 2;
        t[1] = ar[ran];
        t[2] = ar[ran] + 3;
        ar.splice(ran, 1);
        ar = t.concat(ar);
    }
    else if (ar[ran] < 400)
    {
        t[0] = 1;
        t[1] = ar[ran];
        ar.splice(ran, 1);
        ar = t.concat(ar);
    }
    else
    {
        t[0] = 2;
        t[1] = ar[ran];
        t[2] = dd;
        ar.splice(ran, 1);
        ar = t.concat(ar);
    } // end if
    return(ar);
} // End of the function
function dfpai2()
{
    var w = new Array(101, 102, 103, 104, 105, 106, 107, 108, 109);
    var b = new Array(201, 202, 203, 204, 205, 206, 207, 208, 209);
    var t = new Array(301, 302, 303, 304, 305, 306, 307, 308, 309);
    var z = new Array(401, 402, 403, 404, 405, 406, 407);
    var ar = new Array();
    var d = 400 + int(random(69) / 10) + 1;
    ar.push(104, 106);
    var r = random(69) + 1;
    var i = 0;
    for (r = int(r / 10); i <= 2; r = r + 1)
    {
        ar.push(b[r]);
        i = i + 1;
    } // end of for
    var r = random(69) + 1;
    var i = 0;
    for (r = int(r / 10); i <= 2; r = r + 1)
    {
        ar.push(t[r]);
        i = i + 1;
    } // end of for
    var ran = int(random(39) / 10);
    if (ran == 0)
    {
        var r = random(69) + 1;
        var i = 0;
        for (r = int(r / 10); i <= 2; r = r + 1)
        {
            ar.push(w[r]);
            i = i + 1;
        } // end of for
    } // end if
    if (ran == 1)
    {
        var r = random(69) + 1;
        var i = 0;
        for (r = int(r / 10); i <= 2; r = r + 1)
        {
            ar.push(b[r]);
            i = i + 1;
        } // end of for
    } // end if
    if (ran == 2)
    {
        var r = random(69) + 1;
        var i = 0;
        for (r = int(r / 10); i <= 2; r = r + 1)
        {
            ar.push(t[r]);
            i = i + 1;
        } // end of for
    } // end if
    if (ran == 3)
    {
        var r = random(69) + 1;
        var i = 0;
        r = int(r / 10);
        while (i <= 2)
        {
            ar.push(z[r]);
            i = i + 1;
        } // end while
        if (r <= 5)
        {
            d = z[r + 1];
        }
        else
        {
            d = z[0];
        } // end if
    } // end if
    var ran = (int(random(399) / 100) + 1) * 100 + int(random(89) / 10) + 1;
    if (ran > 400)
    {
        ar.push(d, d);
    }
    else
    {
        ar.push(ran, ran);
    } // end if
    var t = new Array();
    t[0] = 1;
    t[1] = 105;
    ar = t.concat(ar);
    dfan[4] = b_fan[4];
    return(ar);
} // End of the function
function dfpai3()
{
    var w = new Array(101, 102, 103, 104, 105, 106, 107, 108, 109);
    var b = new Array(201, 202, 203, 204, 205, 206, 207, 208, 209);
    var t = new Array(301, 302, 303, 304, 305, 306, 307, 308, 309);
    var z = new Array(401, 402, 403, 404, 405, 406, 407);
    var ar = new Array();
    var d = 400 + int(random(69) / 10) + 1;
    var r1 = 5;
    var r2 = 6;
    var r3 = 7;
    var r = int(random(299) / 100) + 1;
    var r1 = r;
    var i = 0;
    while (i <= 8)
    {
        ar.push(r * 100 + i + 1);
        i = i + 1;
    } // end while
    var ran = int(random(39) / 10);
    var r2 = ran + 1;
    if (ran == 0)
    {
        var r = random(69) + 1;
        var i = 0;
        for (r = int(r / 10); i <= 2; r = r + 1)
        {
            ar.push(w[r]);
            i = i + 1;
        } // end of for
    } // end if
    if (ran == 1)
    {
        var r = random(69) + 1;
        var i = 0;
        for (r = int(r / 10); i <= 2; r = r + 1)
        {
            ar.push(b[r]);
            i = i + 1;
        } // end of for
    } // end if
    if (ran == 2)
    {
        var r = random(69) + 1;
        var i = 0;
        for (r = int(r / 10); i <= 2; r = r + 1)
        {
            ar.push(t[r]);
            i = i + 1;
        } // end of for
    } // end if
    if (ran == 3)
    {
        var r = random(69) + 1;
        var i = 0;
        r = int(r / 10);
        while (i <= 2)
        {
            ar.push(z[r]);
            i = i + 1;
        } // end while
        if (r <= 5)
        {
            d = z[r + 1];
        }
        else
        {
            d = z[0];
        } // end if
    } // end if
    var ran = (int(random(399) / 100) + 1) * 100 + int(random(89) / 10) + 1;
    if (ran > 400)
    {
        ar.push(d, d);
        var dd = d;
    }
    else
    {
        var r3 = int(ran / 100);
        ar.push(ran, ran);
        var dd = ran;
    } // end if
    var t = new Array();
    var ran = int(random(1199) / 100);
    if (ran >= 0 && ran <= 8)
    {
        t[0] = 1;
        t[1] = ar[ran];
        if (t[1] == 105)
        {
            dfan[4] = b_fan[4];
        } // end if
        ar.splice(ran, 1);
        ar = t.concat(ar);
    }
    else if (ar[ran] % 100 <= 6 && ar[ran] < 400)
    {
        t[0] = 2;
        t[1] = ar[ran];
        t[2] = ar[ran] + 3;
        ar.splice(ran, 1);
        ar = t.concat(ar);
    }
    else if (ar[ran] < 400)
    {
        t[0] = 1;
        t[1] = ar[ran];
        ar.splice(ran, 1);
        ar = t.concat(ar);
    }
    else
    {
        t[0] = 2;
        t[1] = ar[ran];
        t[2] = dd;
        ar.splice(ran, 1);
        ar = t.concat(ar);
    } // end if
    if (r1 == r2 && r2 == r3)
    {
        dfan[8] = b_fan[8];
    } // end if
    dfan[5] = b_fan[5];
    return(ar);
} // End of the function
function dfpai4()
{
    var w = new Array(101, 102, 103, 104, 105, 106, 107, 108, 109);
    var b = new Array(201, 202, 203, 204, 205, 206, 207, 208, 209);
    var t = new Array(301, 302, 303, 304, 305, 306, 307, 308, 309);
    var z = new Array(401, 402, 403, 404, 405, 406, 407);
    var ar = new Array();
    var all = new Array();
    all = all.concat(w);
    all = all.concat(b);
    all = all.concat(t);
    all = all.concat(z);
    var i = 0;
    var j = 0;
    while (i <= 6)
    {
        var len = (all.length - 1) * 100 + 99;
        var ran = int(random(len) / 100);
        ar.push(all[ran], all[ran]);
        if (i == 0)
        {
            var xt = int(all[ran]) / 100;
        } // end if
        if (xt == int(all[ran]) / 100)
        {
            j = j + 1;
        } // end if
        all.splice(ran, 1);
        i = i + 1;
    } // end while
    if (i == j)
    {
        if (int(ar[0] / 100) == 4)
        {
            dfan[14] = b_fan[14];
        }
        else
        {
            dfan[8] = b_fan[8];
        } // end if
    } // end if
    var t = new Array();
    var ran = int(random(1399) / 100);
    t[0] = 1;
    t[1] = ar[ran];
    ar.splice(ran, 1);
    ar = t.concat(ar);
    dfan[6] = b_fan[6];
    return(ar);
} // End of the function
function dfpai5()
{
    var p1 = new Array(101, 102, 103, 104, 105, 106, 107, 108, 109);
    var p2 = new Array(201, 202, 203, 204, 205, 206, 207, 208, 209);
    var p3 = new Array(301, 302, 303, 304, 305, 306, 307, 308, 309);
    var p4 = new Array(401, 402, 403, 404, 405, 406, 407);
    var ar = new Array();
    var all = new Array();
    var ran = int(random(399) / 100) + 1;
    var rrr = ran;
    all = all.concat(eval("p" + ran));
    var i = 0;
    while (i <= 3)
    {
        var len = (all.length - 1) * 100 + 99;
        var ran = int(random(len) / 100);
        ar.push(all[ran], all[ran], all[ran]);
        all.splice(ran, 1);
        i = i + 1;
    } // end while
    var len = (all.length - 1) * 100 + 99;
    var ran = int(random(len) / 100);
    ar.push(all[ran], all[ran]);
    var dd = all[ran];
    var t = new Array();
    var ran = int(random(1299) / 100);
    t[0] = 2;
    t[1] = ar[ran];
    t[2] = dd;
    ar.splice(ran, 1);
    ar = t.concat(ar);
    if (rrr == 4)
    {
        dfan[14] = b_fan[14];
    }
    else
    {
        dfan[8] = b_fan[8];
    } // end if
    return(ar);
} // End of the function
function dfpai6()
{
    var w = new Array(101, 102, 103, 104, 105, 106, 107, 108, 109);
    var b = new Array(201, 202, 203, 204, 205, 206, 207, 208, 209);
    var t = new Array(301, 302, 303, 304, 305, 306, 307, 308, 309);
    var z = new Array(401, 402, 403, 404, 405, 406, 407);
    var ar = new Array();
    var d = 400 + int(random(69) / 10) + 1;
    var rr = int(random(299) / 100) + 1;
    var i = 0;
    while (i <= 8)
    {
        ar.push(rr * 100 + i + 1);
        i = i + 1;
    } // end while
    if (rr == 1)
    {
        ar.splice(4, 1);
        var ran = int(random(29) / 10) + 1;
        if (ran == 0)
        {
            var r = random(69) + 1;
            var i = 0;
            for (r = int(r / 10); i <= 2; r = r + 1)
            {
                ar.push(w[r]);
                i = i + 1;
            } // end of for
        } // end if
        if (ran == 1)
        {
            var r = random(69) + 1;
            var i = 0;
            for (r = int(r / 10); i <= 2; r = r + 1)
            {
                ar.push(b[r]);
                i = i + 1;
            } // end of for
        } // end if
        if (ran == 2)
        {
            var r = random(69) + 1;
            var i = 0;
            for (r = int(r / 10); i <= 2; r = r + 1)
            {
                ar.push(t[r]);
                i = i + 1;
            } // end of for
        } // end if
        if (ran == 3)
        {
            var r = random(69) + 1;
            var i = 0;
            r = int(r / 10);
            while (i <= 2)
            {
                ar.push(z[r]);
                i = i + 1;
            } // end while
            if (r <= 5)
            {
                d = z[r + 1];
            }
            else
            {
                d = z[0];
            } // end if
        } // end if
    }
    else
    {
        ar.push(104, 106);
    } // end if
    var ran = (int(random(399) / 100) + 1) * 100 + int(random(89) / 10) + 1;
    if (ran > 400)
    {
        ar.push(d, d);
    }
    else
    {
        ar.push(ran, ran);
    } // end if
    var t = new Array();
    t[0] = 1;
    t[1] = 105;
    ar = t.concat(ar);
    dfan[4] = b_fan[4];
    dfan[5] = b_fan[5];
    return(ar);
} // End of the function
function dfpai7()
{
    var p1 = new Array(101, 102, 103, 104, 105, 106, 107, 108, 109);
    var p2 = new Array(201, 202, 203, 204, 205, 206, 207, 208, 209);
    var p3 = new Array(301, 302, 303, 304, 305, 306, 307, 308, 309);
    var p4 = new Array(401, 402, 403, 404, 405, 406, 407);
    var ar = new Array();
    var all = new Array();
    var ran = int(random(399) / 100) + 1;
    var rrr = ran;
    all = all.concat(eval("p" + ran));
    var i = 0;
    while (i <= 6)
    {
        var len = (all.length - 1) * 100 + 99;
        var ran = int(random(len) / 100);
        ar.push(all[ran], all[ran]);
        all.splice(ran, 1);
        i = i + 1;
    } // end while
    var t = new Array();
    var ran = int(random(1399) / 100);
    t[0] = 1;
    t[1] = ar[ran];
    ar.splice(ran, 1);
    ar = t.concat(ar);
    dfan[6] = b_fan[6];
    if (rrr == 4)
    {
        dfan[14] = b_fan[14];
    }
    else
    {
        dfan[8] = b_fan[8];
    } // end if
    return(ar);
} // End of the function
function dfpai8()
{
    var p1 = new Array(101, 102, 103, 104, 105, 106, 107, 108, 109);
    var p2 = new Array(201, 202, 203, 204, 205, 206, 207, 208, 209);
    var p3 = new Array(301, 302, 303, 304, 305, 306, 307, 308, 309);
    var p4 = new Array(401, 402, 403, 404, 405, 406, 407);
    var ar = new Array();
    var all = new Array();
    var ran = int(random(299) / 100) + 1;
    all = all.concat(eval("p" + ran));
    var i = 0;
    while (i <= 8)
    {
        ar.push(ran * 100 + i + 1);
        i = i + 1;
    } // end while
    var r = random(69) + 1;
    var i = 0;
    for (r = int(r / 10); i <= 2; r = r + 1)
    {
        ar.push(eval("p" + ran)[r]);
        i = i + 1;
    } // end of for
    var r = int(random(599) / 100) + 1;
    var arll = ar.length - 1;
    var arl = ar[arll] % 100;
    if (r + arl > 9)
    {
        r = r + arl - 9;
    }
    else
    {
        r = r + arl;
    } // end if
    ran = ran * 100 + r;
    ar.push(ran, ran);
    var t = new Array();
    var ran = int(random(1199) / 100);
    if (ran >= 0 && ran <= 8)
    {
        t[0] = 1;
        t[1] = ar[ran];
        if (t[1] == 105)
        {
            dfan[4] = b_fan[4];
        } // end if
        ar.splice(ran, 1);
        ar = t.concat(ar);
    }
    else if (ar[ran] % 100 <= 6)
    {
        t[0] = 2;
        t[1] = ar[ran];
        t[2] = ar[ran] + 3;
        ar.splice(ran, 1);
        ar = t.concat(ar);
    }
    else
    {
        t[0] = 1;
        t[1] = ar[ran];
        ar.splice(ran, 1);
        ar = t.concat(ar);
    } // end if
    if (r1 == r2 && r2 == r3)
    {
        dfan[8] = b_fan[8];
    } // end if
    dfan[5] = b_fan[5];
    return(ar);
} // End of the function
function dfpai(ar)
{
    var rrr = ar;
    var rand = random(rrr);
    var shuzu = new Array();
    if (rand >= 1350 && rand < rrr)
    {
        shuzu = dfpai1();
    }
    else if (rand >= 1250 && rand < 1350)
    {
        shuzu = dfpai8();
    }
    else if (rand >= 1100 && rand < 1250)
    {
        shuzu = dfpai2();
    }
    else if (rand >= 800 && rand < 1100)
    {
        shuzu = dfpai3();
    }
    else if (rand >= 500 && rand < 800)
    {
        shuzu = dfpai4();
    }
    else if (rand >= 300 && rand < 500)
    {
        shuzu = dfpai5();
    }
    else if (rand >= 100 && rand < 300)
    {
        shuzu = dfpai6();
    }
    else if (rand >= 0 && rand < 100)
    {
        shuzu = dfpai7();
    } // end if
    return(shuzu);
} // End of the function
b_fan = new Array(1, 1, 1, 1, 1, 1, 1, 2, 2, 8, 2, 1, 2, 2, 2, 0, 0);
a101 = new Array(101, 102, 103);
a102 = new Array(102, 103, 104);
a103 = new Array(103, 104, 105);
a104 = new Array(104, 105, 106);
a105 = new Array(105, 106, 107);
a106 = new Array(106, 107, 108);
a107 = new Array(107, 108, 109);
a201 = new Array(201, 202, 203);
a202 = new Array(202, 203, 204);
a203 = new Array(203, 204, 205);
a204 = new Array(204, 205, 206);
a205 = new Array(205, 206, 207);
a206 = new Array(206, 207, 208);
a207 = new Array(207, 208, 209);
a301 = new Array(301, 302, 303);
a302 = new Array(302, 303, 304);
a303 = new Array(303, 304, 305);
a304 = new Array(304, 305, 306);
a305 = new Array(305, 306, 307);
a306 = new Array(306, 307, 308);
a307 = new Array(307, 308, 309);
b103 = new Array(103, 102, 101);
b104 = new Array(104, 103, 102);
b105 = new Array(105, 104, 103);
b106 = new Array(106, 105, 104);
b107 = new Array(107, 106, 105);
b108 = new Array(108, 107, 106);
b109 = new Array(109, 108, 107);
b203 = new Array(203, 202, 201);
b204 = new Array(204, 203, 202);
b205 = new Array(205, 204, 203);
b206 = new Array(206, 205, 204);
b207 = new Array(207, 206, 205);
b208 = new Array(208, 207, 206);
b209 = new Array(209, 208, 207);
b303 = new Array(303, 302, 301);
b304 = new Array(304, 303, 302);
b305 = new Array(305, 304, 303);
b306 = new Array(306, 305, 304);
b307 = new Array(307, 306, 305);
b308 = new Array(308, 307, 306);
b309 = new Array(309, 308, 306);
pl = new Array(136);
pl[0] = 101;
pl[1] = 101;
pl[2] = 101;
pl[3] = 101;
pl[4] = pl[5] = pl[6] = pl[7] = 102;
pl[8] = pl[9] = pl[10] = pl[11] = 103;
pl[12] = pl[13] = pl[14] = pl[15] = 104;
pl[16] = pl[17] = pl[18] = pl[19] = 105;
pl[20] = pl[21] = pl[22] = pl[23] = 106;
pl[24] = pl[25] = pl[26] = pl[27] = 107;
pl[28] = pl[29] = pl[30] = pl[31] = 108;
pl[32] = pl[33] = pl[34] = pl[35] = 109;
pl[36] = pl[37] = pl[38] = pl[39] = 201;
pl[40] = pl[41] = pl[42] = pl[43] = 202;
pl[44] = pl[45] = pl[46] = pl[47] = 203;
pl[48] = pl[49] = pl[50] = pl[51] = 204;
pl[52] = pl[53] = pl[54] = pl[55] = 205;
pl[56] = pl[57] = pl[58] = pl[59] = 206;
pl[60] = pl[61] = pl[62] = pl[63] = 207;
pl[64] = pl[65] = pl[66] = pl[67] = 208;
pl[68] = pl[69] = pl[70] = pl[71] = 209;
pl[72] = pl[73] = pl[74] = pl[75] = 301;
pl[76] = pl[77] = pl[78] = pl[79] = 302;
pl[80] = pl[81] = pl[82] = pl[83] = 303;
pl[84] = pl[85] = pl[86] = pl[87] = 304;
pl[88] = pl[89] = pl[90] = pl[91] = 305;
pl[92] = pl[93] = pl[94] = pl[95] = 306;
pl[96] = pl[97] = pl[98] = pl[99] = 307;
pl[100] = pl[101] = pl[102] = pl[103] = 308;
pl[104] = pl[105] = pl[106] = pl[107] = 309;
pl[108] = pl[109] = pl[110] = pl[111] = 401;
pl[112] = pl[113] = pl[114] = pl[115] = 402;
pl[116] = pl[117] = pl[118] = pl[119] = 403;
pl[120] = pl[121] = pl[122] = pl[123] = 404;
pl[124] = pl[125] = pl[126] = pl[127] = 405;
pl[128] = pl[129] = pl[130] = pl[131] = 406;
pl[132] = pl[133] = pl[134] = pl[135] = 407;

