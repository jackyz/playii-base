/***************************************************************
* 文件名：hu.cpp                                              *
*                                                             *
* 功  能：演示一个简洁明了的递归函数——判断[麻将]的和牌。    *
*                                                             *
* 说  明：1.  此函数不判断七对和十三幺，读者不难自行判断；    *
* 　　　　同时由于麻将的规则各不相同，也请读者自己添加和修改。*
*                                                             *
* 　　　　2.  其他与麻将类似的游戏，如[字牌]（又称跑胡子、    *
* 　　　　二七十）等牌类游戏，也可采用类似的判断函数。        *
*                                                             *
* 环  境: VC 6.0,  但符合ANSI C标准，随便移植 ^_^             *
*                                                             *
* 作  者：shyworm(怕怕虫)                                     *
* E_Mail: shyworm@sina.com                                    *
***************************************************************/
#include <stdio.h>;

int Hu(int PAI[38]);
int Remain(int PAI[38]);

int main()
{
    // 把一副牌放在下面的数组里，可以任意填入数字来测试函数正确与否。
    // 为了方便，PAI[0],PAI[10],PAI[20],PAI[30]都弃之不用，并且必须
    // 置为0，千万注意！
    int PAI[38] = { 0,
                    1,1,1,0,1,1,1,0,0,    // PAI[ 1- 9]  壹万～玖万的个数
                    0,
                    0,0,0,0,0,3,0,0,0,    // PAI[11-19]  壹铜～玖铜的个数
                    0,
                    0,0,0,0,0,0,0,0,0,    // PAI[21-29]  壹条～玖条的个数
                    0,
                    0,1,1,1,0,0,0         // PAI[31-37]  东南西北中发白的个数
                    };

    // 请务必先排除“七对” 和“十三幺”，由于简单，所以不提供了
    // if( QIDUI(PAI) )...
    // if( SHISANYAO(PAI) )...

    if( Hu(PAI) )  
        printf("哈！我和啦！\n");
    else
        printf("哎，和不成！\n");

    return 1;
}

// 判断和牌的递归函数，不考虑“七对” 和“十三幺”。因为如果
// 把“七对” 和“十三幺”的判断放在递归函数里，将得不偿失。
int Hu(int PAI[38])
{
    static int JIANG = 0;            // 将牌标志，即牌型“三三三三二”中的“二”

    if( !Remain(PAI) ) return 1;     // 递归退出条件：如果没有剩牌，则和牌返回。

    for(int i=1;!PAI[i]&&i<38;i++);  // 找到有牌的地方，i就是当前牌, PAI[i]是个数

    printf("i = %d\n",i);            // 跟踪信息

    // 4张组合(杠子)
    if ( PAI[i] == 4 )               // 如果当前牌数等于4张
    {
        PAI[i] = 0;                  // 除开全部4张牌
        if( Hu(PAI) ) return 1;      // 如果剩余的牌组合成功，和牌
        PAI[i] = 4;                  // 否则，取消4张组合
    }

    // 3张组合(大对)
    if ( PAI[i] >;= 3 )               // 如果当前牌不少于3张
    {
        PAI[i] -= 3;                 // 减去3张牌
        if( Hu(PAI) ) return 1;      // 如果剩余的牌组合成功，和牌
        PAI[i] += 3;                 // 取消3张组合
    }

    // 2张组合(将牌)
    if ( !JIANG && PAI[i] >;= 2 )     // 如果之前没有将牌，且当前牌不少于2张
    {
        JIANG = 1;                   // 设置将牌标志
        PAI[i] -= 2;                 // 减去2张牌
        if( Hu(PAI) ) return 1;      // 如果剩余的牌组合成功，和牌
        PAI[i] += 2;                 // 取消2张组合
        JIANG = 0;                   // 清除将牌标志
    }

   
    if ( i >; 30 )    return 0;       // “东南西北中发白”没有顺牌组合，不和

    // 顺牌组合，注意是从前往后组合！
    if( i%10 != 8 && i%10 != 9  &&   // 排除数值为8和9的牌
         PAI[i+1] && PAI[i+2] )      // 如果后面有连续两张牌
    {
        PAI[i]--;
        PAI[i+1]--;
        PAI[i+2]--;                  // 各牌数减1
        if( Hu(PAI) ) return 1;      // 如果剩余的牌组合成功，和牌
        PAI[i]++;
        PAI[i+1]++;
        PAI[i+2]++;                  // 恢复各牌数
    }

    // 无法全部组合，不和！
    return 0;
}

// 检查剩余牌数
int Remain(int PAI[38])
{
    int sum = 0;
    for(int i=1;i<38;i++)
        sum += PAI[i];
    return sum;
}







  /*  
  万牌:   一万至九万,用1~9表示  
  条牌:   一条至九条,用21~29表示  
  筒牌:   一筒至九筒,用41~49表示  
  字牌:   东61,   南64,   西67,   北70,   中73,   发76,   白79  
  百搭:   用100表示  
   
  麻将中以十四张牌计算胡牌  
  胡牌的基本牌型  
  AA   XXX   XXX   XXX   XXX  
  (注：AA=将或对子   XXX=任意的顺子(如123)、刻子(如444))  
  */  
   
   
  #include   <iostream.h>  
   
  #define   BD 100 //wild   card  
  #define   MAXG 14 //the   max.   number   of   groups   divided  
  #define   MAXC 28 //the   max.   number   of   groups   created  
   
  int   mjlist[14];  
  int   select[14];  
  int   glist[MAXG][MAXC][3];    
  int   trace[MAXG][3];  
  int   node;  
   
  int   creategroup(int   d);  
  void   makegroup(int   gr[]);  
  void   unmakegroup(int   gr[]);  
  int   search(int   d);  
  int   iswin();  
  void   disp();  
   
  main()  
  {  
   
  int   i,   j;  
  cout   <<   "万牌:   一万至九万,用1~9表示"<<endl;  
  cout   <<   "条牌:   一条至九条,用21~29表示"<<endl;  
  cout   <<   "筒牌:   一筒至九筒,用41~49表示"<<endl;  
  cout   <<   "字牌:   东61,   南64,   西67,   北70,   中73,   发76,   白79"<<endl;  
  cout   <<   "百搭:   用100表示"<<endl<<endl;  
   
  cout   <<   "请按从小到大输入牌局："<<endl;  
  int   mj[14];    
   
  for(i=0;   i<14;   i++)  
  {  
  cin>>mj[i];  
  mjlist[i]   =   mj[i];  
  }  
   
   
  cout   <<   "MJ   list:";  
   
  for(i=0;   i<14;   i++)  
  {  
  cout   <<   "   "   <<   mjlist[i];  
  }  
  cout   <<   endl;  
   
  for(i=0;   i<14;   i++)  
  select[i]   =   0;  
   
   
  for(i=0;   i<MAXG;   i++)    
  for(j=0;   j<3;   j++)    
  trace[i][j]   =   -2;  
   
  node   =   0;  
  int   r;  
  r   =   search(0);  
   
  // cout<<"node:"<<node<<endl; //test  
  if(r)  
  {  
   
  disp();  
  cout   <<   "win   !"   <<   endl;  
  }  
   
  else  
  cout   <<   "fail   !"<<   endl;  
   
   
  return   0;  
  }  
   
   
  int   creategroup(int   d)  
  {  
  int   c,c1,i,j,k,t,nbd;  
   
  nbd   =   0;  
  for(i=0;   i<14;   i++)  
  {  
  if(mjlist[i]   ==   BD)  
  nbd++;  
  }  
   
   
  for(i=0;   i<d;   i++)  
  {  
  if(trace[i][1]==-1   ||   trace[i][2]!=-1)  
  continue;  
  if(mjlist[trace[i][0]]   !=   mjlist[trace[i][1]])  
  nbd--;  
   
  }  
   
  if   (nbd<0)  
  {  
   
  return   -1;  
  }  
   
  for(c=0;   c<MAXC;   c++)  
  {  
  glist[d][c][0]   =   -1;  
  glist[d][c][1]   =   -1;  
  glist[d][c][2]   =   -1;  
  }  
   
  c   =   0;  
  t   =   -1;  
  for(i=0;   i<14;   i++) //   search   ke   zi  
  {  
   
  if(select[i]==1   ||   t==mjlist[i]   ||   mjlist[i]==BD)  
  continue;  
  t   =   mjlist[i];  
   
   
  k   =   0;  
  for(j=i;   j<14;   j++)  
  if(mjlist[j]==t)  
  {  
  glist[d][c][k]   =   j;  
  k++;  
  if(k==3)  
  break;  
  }  
  c++;  
  }  
   
  c1   =   c;  
  t   =   -1;  
  for(i=0;   i<14;   i++) //   search   shun   zi  
  {  
   
  if(select[i]==1   ||   t==mjlist[i]   ||   mjlist[i]==BD)  
  continue;  
  t   =   mjlist[i];  
   
  k   =   0;  
  for(j=i;   j<14;   j++)  
  if(mjlist[j]==t+1   &&   select[j]==0)  
  {  
  k++;  
  glist[d][c][k]   =   j;  
   
  break;  
  }  
   
  for(j=i;   j<14;   j++)  
  if(mjlist[j]==t+2   &&   select[j]==0)  
  {  
  k++;  
  glist[d][c][k]   =   j;  
   
  break;  
  }  
   
   
   
  if(k+nbd   >=   2)  
  {  
  glist[d][c][0]   =   i;      
  c++;  
  c1   -=   k;    
  }  
  }  
   
   
  if(c1>5)  
  return   -1;  
  return   c;  
  }  
   
   
  void   makegroup(int   gr[])  
  {  
  int   i;  
  for   (i=0;   i<3;   i++)  
  {  
  if(gr[i]   !=   -1)  
  select[gr[i]]   =   1;  
  }  
  }  
   
  void   unmakegroup(int   gr[])  
  {  
  }  
   
  int   search(int   d)  
  {  
  node++;  
   
  int   count,   i,   j,   res;  
   
  int   orgsel[14];  
  count   = creategroup(d);  
   
  if(count==0)  
  return   iswin();  
   
  if(d==5   &&   count>0)  
  return   0;  
   
  for(i=0;   i<count;   i++)  
  {  
  for(j=0;   j<14;   j++)  
  orgsel[j]   =   select[j];  
   
   
  makegroup(glist[d][i]);  
   
   
  trace[d][0]   =   glist[d][i][0];  
  trace[d][1]   =   glist[d][i][1];  
  trace[d][2]   =   glist[d][i][2];  
   
   
   
  res   =   search(d+1);  
   
  for(j=0;   j<14;   j++) //   unmake  
  select[j]   =   orgsel[j];  
   
  if(res==0)  
  {  
  trace[d][0]   =   -2;  
  trace[d][1]   =   -2;  
  trace[d][2]   =   -2;  
  }  
   
  if   (res)  
  return   1;  
   
   
  }  
   
  return   0;  
  }  
   
  int   iswin()  
  {  
  int   d,   i,   sum;  
  int   grlen[MAXG]; //   group   length  
   
  for(d=0;   d<MAXG;   d++)  
  {  
  grlen[d]   =   0;  
  }  
   
  for(d=0;   ;d++)  
  {  
  if(trace[d][0]==-2)  
  break;  
   
  int   t   =   mjlist[trace[d][1]]   -   mjlist[trace[d][0]];  
  if(t==1   ||   t==2) //   shun   zi   group  
  grlen[d]   =   3;  
  else  
  {  
  for(i=0;   i<3;   i++)  
  if(trace[d][i]   !=   -1)  
  grlen[d]++;  
  if(grlen[d]<2)  
  grlen[d]   =   2;  
  }  
  }  
   
   
   
  sum   =   0;  
  for(d=0;   d<MAXG;   d++)  
  {  
  sum   +=   grlen[d];  
  }  
   
   
  if(sum   <=   14) //   sum   is   the   minimum   length    
  return   1;  
   
  else  
  return   0;  
   
  }  
   
  void   disp()  
  {  
  int   i,   j,   n;  
  int   gdisp[MAXG][3];  
   
  for(i=0;   i<MAXG;   i++)  
  {  
  gdisp[i][0]   =   0;  
  gdisp[i][1]   =   0;  
  gdisp[i][2]   =   0;  
  }  
   
  n   =   0;  
  for(i=0;   i<14;   i++)  
  if(mjlist[i]   ==   BD)  
  n++;  
   
   
  for(i=0;   i<MAXG;   i++)    
  {  
  if(trace[i][0]   ==   -2)  
  break;  
   
  gdisp[i][0]   =   mjlist[trace[i][0]];  
   
   
  if   (trace[i][1]   !=   -1)  
  gdisp[i][1]   =   mjlist[trace[i][1]];  
   
  if   (trace[i][2]   !=   -1)  
  gdisp[i][2]   =   mjlist[trace[i][2]];  
   
   
  }  
   
  for(i=0;   i<MAXG;   i++)    
  {  
  if(n==0   ||   gdisp[i][0]==0)  
  break;  
   
  if(gdisp[i][1]   ==   0)  
  {  
  gdisp[i][1]   =   BD;  
  n--;  
  continue;  
  }  
   
  if(gdisp[i][2]==0   &&   gdisp[i][0]!=gdisp[i][1])  
  {  
  gdisp[i][2]   =   BD;  
  n--;  
  }  
   
  }  
   
   
  for(i=0;   ;i++)  
  {  
  if(n==0)  
  break;  
  if(gdisp[i][0]==0)  
  {  
  gdisp[i][0]   =   BD;  
  n--;  
  if(n==0)  
  break;  
  }  
   
  if(gdisp[i][1]==0)  
  {  
  gdisp[i][1]   =   BD;  
  n--;  
  if(n==0)  
  break;  
  }  
   
  if(gdisp[i][2]==0)  
  {  
  gdisp[i][2]   =   BD;  
  n--;  
  if(n==0)  
  break;  
  }  
   
  }  
   
  for(i=0;   i<MAXG;   i++)    
  {  
  if(gdisp[i][0]==0)  
  break;  
   
  for(j=0;   j<3;   j++)  
  {  
  if(gdisp[i][j]   ==   0)  
  break;  
  cout   <<   gdisp[i][j]   <<"   ";  
  }  
  cout   <<   endl;  
   
  }  
  cout   <<   endl;  
   
  }  
    
