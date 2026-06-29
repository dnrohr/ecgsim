<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
    <head>
        <title>ECGSIM Manual: Update ECGSIM</title>        <!--META TAGS-->
        <meta http-equiv="Content-type" content="text/html; charset=iso-8859-15">
        <!--FAVICON-->
        <link rel="shortcut icon" href="../favicon.ico">
        <!--lINK TO EXTERNAL STYLE SHEET-->
        <link rel="stylesheet" type="text/css" href="../stylesheet.css">
    </head>

    <body>
        
        <!--START LAYOUT DIV-->
<div class="layout">
<!--START LOGOTYPE MET LINK NAAR HOMEPAGE-->
        <a name="top"></a><a href="../index.php"><img src="../graphics/logotype.png" id="logo" alt="To the Homepage" title="To the Homepage"></a>

        <!--END LOGOTYPE-->

                    <!--START HEADERBAR-->
                    <!-- DE HEADERBAR IS HET BOVENSTE HORIZONTALE NAVIGATIEMENU -->
<p>
<div class="headerbar">

<a href='../index.php'>HOME</a> <img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='../introduction.php'>INTRODUCTION</a> <img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='../downloads/'>DOWNLOADS</a> <img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''>MANUAL<img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='../aboutus.php'>ABOUT&nbsp;US</a> 
</div>

                    <!--END HEADERBAR-->

                                <!--START MANUALSIDEBAR-->
                <div class="submenu">

<a href='index.php'>Introduction</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='basic.php'>Basic&nbsp;Usage</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='heart.php'>Heart</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='thorax.php'>Thorax</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='membrane.php'>TMP</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='leads.php'>Leads</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='toolbox.php'>Tools</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='focus.php'>Focus</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='options.php'>Preferences</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php'>Case&nbsp;Files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='changes.php'>Versions</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='file.php#download'>Download&nbsp;case&nbsp;files</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''>Update&nbsp;ECGSIM<img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='ref.php'>Publications</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''><a href='license.php'>License&nbsp;terms</a><img src='graphics/whitespace.png' class='whitepace-navigationbar' alt=''></div>                <!--END MANUALSIDEBAR-->
                
                <!--START TEXT-->
                
<!--START LAYOUT DIV-->
<div class="layout">
        <h1>Update ECGSIM</h1>

        <p class="text">
            ECGSIM is being actively developed resulting in new versions being published on
            <a href= "http://www.ecgsim.org/downloads/ecgsimprogram.php">www.ecgsim.org</a>.
            New versions can be downloaded and installed manually. Removing previous
            installation is not needed.<br />
            Apart from manually checking and installing, there are two automated ways to check
            for updates and retrieve them.
        </p>

        <a id="UpdateCheck" name="UpdateCheck"></a>
        <h2>Check for updates</h2>

        <p class="text">
            You can check for updates from within the ECGSIM application. This is done by pressing
            the <tt>-check for updates-</tt> menu item. For Windows this item is located in the
            <tt>-Help-</tt> main menu item. For OS X it is located in the <tt>-application-</tt>
            menu.
        </p>

        <p class="text">
            When you check for updates, status messages will be shown in the bottom-left corner
            of the application window for approximately 20 seconds.
        </p>

        <p class="text">
            <IMG class="helpimage" alt="" title="" src="graphics/NoUpdateMsg.png" />
        </p>

        <p class="text">
            Possible message are:
            <ul>
                <!--<li>New version of ECGsim found.</li>-->
                <li><tt>No update for ECGsim available.</tt></li>
                <li>
                    <tt>Unable to connect to the update server. Use ECGsimUpdater manualy.</tt><br />
                    If this message is shown the connection failed for some reason. Using the
                    <a href="#ECGsimUpdater">ECGsimUpdater application</a> manually may give
                    more information.
                </li>
                <li>
                    <tt>Update is disabled in the configuration file. See update.ini.</tt><br />
                    If this message is shown you must edit the specified file that is located in
                    the application directory and look for the <tt>check_for_updates</tt> tag.
                    This tag must have the value '1'.
                </li>
                <li>
                    <tt>Update or checking for updates failed.</tt>
                    This message can be caused by a download error, failing to start the installer
                    or a general installer error. Using the
                    <a href="#ECGsimUpdater">ECGsimUpdater application</a> manually or download and
                    perform the installer manually can help.
                </li>
            </ul>
        </p>

        <p class="text">
            If an update is found the following messagebox will popup.
        </p>

        <p class="text">
            <IMG class="helpimage" alt="" title="" src="graphics/NewUpdateDlg.png" />
        </p>

        <p class="text">
            If <tt>&lt;Yes&gt;</tt> is pressed the update process will be started. <b>Part of the process
            is that ECGSIM will be closed.</b> To perform the update follow the steps of the update process.
        </p>


        <a id="ECGsimUpdater" name="ECGsimUpdater"></a>
        <h2>ECGSIM update</h2>

        <p class="text">
            Part of the ECGSIM package comes an extra standalone application that can be used to check
            for an update.
        </p>

        <p class="text">
            <IMG class="helpimage" alt="" title="" src="graphics/UpdateAppInMenu.png" />
        </p>

        <p class="text">
            When starting the application you are guided through the update process.
        </p>

        <p class="text">
            <IMG class="helpimage" alt="" title="" src="graphics/UpdateApp.png" />
        </p>

        <p class="text">
            The application will check for an update from the ECGSIM website. If an update is found
            it can be downloaded from one of the downloadlocation specified (if more then one).<br />
            If the download is completed the installer will start automatically.
        </p>
</div>
<!--END LAYOUT DIV-->
                    <!--END TEXT-->
                                    <!--START FOOTERNAVIGATIONBAR-->
                    <div class="footerbar">


&nbsp;<a href='../index.php'>HOME</a>&nbsp;&nbsp;&nbsp;<a href='../contact.php'>CONTACT&nbsp;US</a>&nbsp;&nbsp;&nbsp;<a href='#top'>TOP OF THIS PAGE</a>&nbsp;

</div>
                    <!--END FOOTERNAVIGATIONBARBAR-->
</div>
                        
        <!--END LAYOUT DIV-->
    </body>
</html>