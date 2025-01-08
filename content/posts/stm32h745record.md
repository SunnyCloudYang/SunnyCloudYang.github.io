---
author: Yang
date: "2024-02-03T19:08:35+08:00"
lastmod: "2024-02-03T22:29:50+08:00"
description: "最近有一个小项目用到了STM32H745这个有两个核的芯片，手字笔录，以作前车之鉴"
title: "STM32H745ZI-Q开发记录"
summary: "核越多，坑越多"
tags: ["record", "STM32H7"]
categories: "post"
cover: 
   image: "images/STM32H745ZI-Q.jpg"
draft: false
comments: true
hideMeta: false
searchHidden: false
ShowBreadCrumbs: true
ShowReadingTime: false
---

## 1. NUCLEO-H745ZI-Q

NUCLEO-H745ZI-Q是ST公司推出的一款开发板，基于STM32H745ZIT6这款芯片，拥有Cortex-M7和Cortex-M4两个核心，主频最高分别可达480MHz和240MHz。板载一个ST-LINK/V3E，带有一个RJ45 Ethernet接口以及其他许多丰富的接口。这也是我第一次接触到两个核的STM32芯片，不过这两个核可以几乎独立地运行，调试过程比我想象的要简单一些。

{{< figure src="/images/STM32H745ZI-Q.jpg" width="500px" align="center" title="NUCLEO-H745ZI-Q" >}}

## 2. 开发环境

开发使用的工具链还是我熟悉的CubeMX + Keil，CubeMX用于生成工程文件，Keil用于编译和调试。CubeMX的版本是6.8.1，Keil MDK的版本是5.38。当然如果主要开发ST家的芯片的话可以尝试CubeIDE一条龙，使用体验和观感应该好于古老的MDK。

## 3. 开发过程

### 3.1. CubeMX配置

在CubeMX的配置环节和其他芯片的配置大同小异，选择芯片或者开发板的型号之后依次配置外设和时钟树即可。这个项目用到的外设比较少，只有一路ADC，一路IIC通信和两个GPIO口。配置外设基本流程如下：

  1. HSE选用25MHz的外部晶振
  2. 勾选一路ADC，打开对应的ADC通道。我这里选了PA4作ADC的输入，PA4为ADC1_INP18，即ADC1的第18个通道，P的意思是差分输入时作正极，在单端输入时作输入（单端输入时N极不起作用）。因此打开ADC1的通道18，选择Single-ended模式即可。这里可以给它指定内核，因为只有M7内核会使用，因此只需要分配给M7内核即可。
  3. 勾选I2C1。默认是PB6（SCL）和PB7（SDA）引脚，分配给M7内核即可。
  4. 两个GPIO口作输出，任选两个，不要和其他外设冲突即可。分别分配给M7和M4内核。
  5. 记得打开Debug的串口，避免烧写完无法重新烧写。
  6. 如果雀食不需要其他引脚可以先在Pinout里全部清除再进行上面的配置。

{{< alert class="warning" >}}
⚠️**注意**：RCC里的电源选项一定要与开发板上的电源相匹配，否则会导致开发板无法正常工作。ZI-Q的硬件电路默认是Direct-SMPS模式，因此在RCC里选择Direct-SMPS（不要更改即可），如果更改会导致烧写一次之后因芯片无法正常供电而无法再次烧写（`No target detected`）。解决办法是按住RESET按钮再上电，等待LD4闪烁到**第四个周期**时松开按钮，擦除flash后重新烧写正常的程序；或者用手册中的方法，将BOOT0引脚（在CN11的7号引脚）置高，然后擦除重写。{{< blockdel >}}（在此强烈谴责某个视频里的老哥，他的视频里把电源选成了LDO，导致我烧写一次之后就再也烧写不进去了，浪费了我一天时间。ps：其实刚开始居然还能正常烧写和运行，但是某次电机金属外壳碰到OLED排针之后就不行了。硬件，玄。{{< /blockdel >}}

这一点其实在User manual [UM2408](https://www.st.com/resource/en/user_manual/um2408-stm32h7-nucleo144-boards-mb1363-stmicroelectronics.pdf)的第6.4.7节中有提到，但是我当时并没有仔细看orz。
{{< /alert >}}

配置时钟树时要注意两个核的频率范围，M7的最高频率是480MHz，M4的最高频率是240MHz，后面一列最高120MHz（其实图上都写了，实在不行就让CubeMX自己配置）。另外HSE的默认值为8MHz，但是板载晶振实际为25MHz，因此需要手动改为25MHz。

### 3.2. Keil配置

编写的时候并不需要特别的配置，但是下载程序时要注意两个核的内存范围，在官方的debug参考手册[AN5286](https://www.st.com/resource/en/application_note/an5286-stm32h7x5x7-dualcore-microcontroller-debugging-stmicroelectronics.pdf)的第5章中给出了相应的配置：

1. CM7工程：

    {{< figure src="/images/cm7-ram.png" width="500px" align="center" title="M7内核配置ROM和RAM" >}}
    {{< figure src="/images/cm7-debug.png" width="500px" align="center" title="M7内核debug配置" >}}
    {{< figure src="/images/cm7-flash.png" width="500px" align="center" title="M7内核配置FLASH" >}}

2. CM4工程：

    {{< figure src="/images/cm4-ram.png" width="500px" align="center" title="M4内核配置ROM和RAM" >}}
    {{< figure src="/images/cm4-debug.png" width="500px" align="center" title="M4内核debug配置" >}}
    {{< figure src="/images/cm4-flash.png" width="500px" align="center" title="M4内核配置FLASH" >}}

板载的ST-Link是V3版本，可能没有Shareable ST-Link选项（也可能是我的ST-Link Server的原因），在调试的时候无法同时调试两个核，只能单核调试。

### 3.3. 编写程序

双核芯片最大的特点就是可以同时运行两个程序，但两个核之间的通信也成了一个不小的难点。这里CM4内核适合于进行实时性高的任务，而CM7内核适合于进行复杂的算法计算。不过在这个项目里并没有明显的差异，因此在这里M4内核仅负责接收M7内核的信号并在对应GPIO口输出，M7内核负责ADC采样和I2C通信（感觉反过来更合适）。

内核之间的通信有许多种方式，在手册[AN5617](https://www.st.com/resource/en/application_note/an5617-stm32h745755-and-stm32h747757-lines-interprocessor-communications-stmicroelectronics.pdf)中给出了每种方式的介绍和示例。这里我使用了HSEM的方式，HSEM是一种硬件信号量，可以用于两个核之间的同步。在H745初始化的过程中就使用了这个方式，在CM7完成外设和供电的相关配置后，通过HSEM信号量通知CM4开始工作。对于HSEM的简单介绍可以在[这个手册](https://www.st.com/content/ccc/resource/training/technical/product_training/group0/2a/6a/df/e1/3b/52/48/b7/STM32H7-System-Hardware_Semaphore_HSEM/files/STM32H7-System-Hardware_Semaphore_HSEM.pdf/_jcr_content/translations/en.STM32H7-System-Hardware_Semaphore_HSEM.pdf)中找到，示例工程则可以在[H747的Examples](https://github.com/STMicroelectronics/STM32CubeH7/tree/ccb11556044540590ca6e45056e6b65cdca2deb2/Projects/STM32H747I-DISCO/Examples/HSEM)中找到。

手册中说一共有32个HSEM中断线，但是在程序中使用`HAL_HSEM_FastTake`上锁和解锁0以外的HSEM时发现CM4并没有执行相应的回调，最后只能使用0号HSEM。可能是没有使能？但我找遍了跟HSEM相关的文件也没有找到使能某一个HSEM的函数，而且这32个应该是一起使能的。官方例程中使用的也都是0号HSEM。这个问题还需要进一步的研究。

### 3.4. 调试

调试时需要分别编译并下载CM7和CM4两个核的工程（顺序无所谓）。这个芯片类似于把两个芯片放在了一块大芯片上，共用一套外设，并且增加了一些内存作为共享，通过AHB等进行通讯，只要想通了这一点其实还是很好理解的。外设的归属取决于外设时钟由哪个内核提供，在手册里也有详细的介绍。

对于调试，最有效的办法还是打断点跟踪程序。我就是发现CM7运行到电源配置时卡死才发现电源配置的问题，拯救了假死状态的开发板。至于HSEM的问题，单步跟踪把我带到了看不懂的地方，只能先放一放了。

## 4. 总结

STM32H745ZI-Q是一款非常强大的芯片，拥有两个核心，丰富的外设和丰富的内存。但是双核的设计也带来了一些问题，比如内核之间的通信，外设的归属等。不过这些问题都是可以解决的，只要理解了它的工作原理，就可以很好地利用它的优势。这个项目的开发过程中也遇到了一些问题，比如电源的选择，内核之间的通信等，但是通过查阅资料和手册，最终都得到了解决。这个项目也是我第一次接触双核的STM32芯片，对于双核的设计有了更深的理解。

{{< blockdel >}}
以上总结由Copilot生成，我想说的是，我还是玩我的f103罢😭
{{< /blockdel >}}

## 5. 参考资料

1. [NUCLEO-H745ZI-Q](https://www.st.com/en/evaluation-tools/nucleo-h745zi-q.html)
2. [STM32H745ZI-Q User manual UM2408](https://www.st.com/resource/en/user_manual/um2408-stm32h7-nucleo144-boards-mb1363-stmicroelectronics.pdf)
3. [STM32H745755 and STM32H747757 lines Interprocessor communications AN5617](https://www.st.com/resource/en/application_note/an5617-stm32h745755-and-stm32h747757-lines-interprocessor-communications-stmicroelectronics.pdf)
4. [STM32H7 System Hardware Semaphore HSEM](https://www.st.com/content/ccc/resource/training/technical/product_training/group0/2a/6a/df/e1/3b/52/48/b7/STM32H7-System-Hardware_Semaphore_HSEM/files/STM32H7-System-Hardware_Semaphore_HSEM.pdf/_jcr_content/translations/en.STM32H7-System-Hardware_Semaphore_HSEM.pdf)
5. [STM32H7x5 and STM32H7x7 Dual-core microcontroller debugging AN5286](https://www.st.com/resource/en/application_note/an5286-stm32h7x5x7-dualcore-microcontroller-debugging-stmicroelectronics.pdf)

{{< collapse1 summary="最后的最后">}}
ST的文档算是非常详实且全面的了，所以如果还有悬而未决的问题，就去**看文档！！！**
{{< /collapse1 >}}
