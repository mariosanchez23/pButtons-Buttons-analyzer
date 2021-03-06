// Windows common net helpmsg 
//FOR /L %G IN (1,1,1000) DO net helpmsg %G
var windowsDict={};
windowsDict[1  ]= " Incorrect function";
windowsDict[2  ]= "The system cannot find the file specified";
windowsDict[3  ]= "The system cannot find the path specified";
windowsDict[4  ]= "The system cannot open the file";
windowsDict[5  ]= "Access is denied";
windowsDict[6  ]= "The handle is invalid";
windowsDict[7  ]= "The storage control blocks were destroyed";
windowsDict[8  ]= "Not enough storage is available to process this command";
windowsDict[9  ]= "The storage control block address is invalid";
windowsDict[10 ]= "The environment is incorrect";
windowsDict[11 ]= "An attempt was made to load a program with an incorrect format";
windowsDict[12 ]= "The access code is invalid";
windowsDict[13 ]= "The data is invalid";
windowsDict[14 ]= "Not enough storage is available to complete this operation";
windowsDict[15 ]= "The system cannot find the drive specified";
windowsDict[16 ]= "The directory cannot be removed";
windowsDict[17 ]= "The system cannot move the file to a different disk drive";
windowsDict[18 ]= "There are no more files";
windowsDict[19 ]= "The media is write protected";
windowsDict[20 ]= "The system cannot find the device specified";
windowsDict[21 ]= "The device is not ready";
windowsDict[22 ]= "The device does not recognize the command";
windowsDict[23 ]= "Data error (cyclic redundancy check)";
windowsDict[24 ]= "The program issued a command but the command length is incorrect";
windowsDict[25 ]= "The drive cannot locate a specific area or track on the disk";
windowsDict[26 ]= "The specified disk or diskette cannot be accessed";
windowsDict[27 ]= "The drive cannot find the sector requested";
windowsDict[28 ]= "The printer is out of paper";
windowsDict[29 ]= "The system cannot write to the specified device";
windowsDict[30 ]= "The system cannot read from the specified device";
windowsDict[31 ]= "A device attached to the system is not functioning";
windowsDict[32 ]= "The process cannot access the file because it is being used by another process";
windowsDict[33 ]= "The process cannot access the file because another process has locked a portion of the file";
windowsDict[36 ]= "Too many files opened for sharing";
windowsDict[38 ]= "Reached the end of the file";
windowsDict[39 ]= "The disk is full";
windowsDict[50 ]= "The request is not supported";
windowsDict[51 ]= "Windows cannot find the network path. Verify that the network path is correct and the destination computer is not busy or turned off. If Windows still windows not find the network path,contact your network administrator";
windowsDict[52 ]= "You were not connected because a duplicate name exists on the network. Go to System in Control Panel to change the computer name and try again";
windowsDict[53 ]= "The network path was not found";
windowsDict[54 ]= "The network is busy";
windowsDict[55 ]= "The specified network resource or device is no longer available";
windowsDict[56 ]= "The network BIOS command limit has been reached";
windowsDict[57 ]= "A network adapter hardware error occurred";
windowsDict[58 ]= "The specified server cannot perform the requested operation";
windowsDict[59 ]= "An unexpected network error occurred";
windowsDict[60 ]= "The remote adapter is not compatible";
windowsDict[61 ]= "The printer queue is full";
windowsDict[62 ]= "Space to store the file waiting to be printed is not available on the server";
windowsDict[63 ]= "Your file waiting to be printed was deleted";
windowsDict[64 ]= "The specified network name is no longer available";
windowsDict[65 ]= "Network access is denied";
windowsDict[66 ]= "The network resource type is not correct";
windowsDict[67 ]= "The network name cannot be found";
windowsDict[68 ]= "The name limit for the local computer network adapter card was exceeded";
windowsDict[69 ]= "The network BIOS session limit was exceeded";
windowsDict[70 ]= "The remote server has been paused or is in the process of being started";
windowsDict[71 ]= "No more connections can be made to this remote computer at this time because there are already as many connections as the computer can accept";
windowsDict[72 ]= "The specified printer or disk device has been paused";
windowsDict[80 ]= "The file exists";
windowsDict[82 ]= "The directory or file cannot be created";
windowsDict[83 ]= "Fail on INT 24";
windowsDict[84 ]= "Storage to process this request is not available";
windowsDict[85 ]= "The local device name is already in use";
windowsDict[86 ]= "The specified network password is not correct";
windowsDict[87 ]= "The parameter is incorrect";
windowsDict[88 ]= "A write fault occurred on the network";
windowsDict[89 ]= "The system cannot start another process at this time";
windowsDict[100]= "Cannot create another system semaphore";
windowsDict[101]= "The exclusive semaphore is owned by another process";
windowsDict[102]= "The semaphore is set and cannot be closed";
windowsDict[103]= "The semaphore cannot be set again";
windowsDict[104]= "Cannot request exclusive semaphores at interrupt time";
windowsDict[105]= "The previous ownership of this semaphore has ended";
windowsDict[107]= "The program stopped because an alternate diskette was not inserted";
windowsDict[108]= "The disk is in use or locked by another process";
windowsDict[109]= "The pipe has been ended";
windowsDict[110]= "The system cannot open the device or file specified";
windowsDict[111]= "The file name is too long";
windowsDict[112]= "There is not enough space on the disk";
windowsDict[113]= "No more internal file identifiers available";
windowsDict[114]= "The target internal file identifier is incorrect";
windowsDict[117]= "The IOCTL call made by the application program is not correct";
windowsDict[118]= "The verify-on-write switch parameter value is not correct";
windowsDict[119]= "The system does not support the command requested";
windowsDict[120]= "This function is not supported on this system";
windowsDict[121]= "The semaphore timeout period has expired";
windowsDict[122]= "The data area passed to a system call is too small";
windowsDict[123]= "The filename, directory name, or volume label syntax is incorrect";
windowsDict[124]= "The system call level is not correct";
windowsDict[125]= "The disk has no volume label";
windowsDict[126]= "The specified module could not be found";
windowsDict[127]= "The specified procedure could not be found";
windowsDict[128]= "There are no child processes to wait for";
windowsDict[130]= "Attempt to use a file handle to an open disk partition for an operation other than raw disk I/O";
windowsDict[131]= "An attempt was made to move the file pointer before the beginning of the file";
windowsDict[132]= "The file pointer cannot be set on the specified device or file";
windowsDict[133]= "A JOIN or SUBST command cannot be used for a drive that contains previously joined drives";
windowsDict[134]= "An attempt was made to use a JOIN or SUBST command on a drive that has already been joined";
windowsDict[135]= "An attempt was made to use a JOIN or SUBST command on a drive that has already been substituted";
windowsDict[136]= "The system tried to delete the JOIN of a drive that is not joined";
windowsDict[137]= "The system tried to delete the substitution of a drive that is not substituted";
windowsDict[138]= "The system tried to join a drive to a directory on a joined drive";
windowsDict[139]= "The system tried to substitute a drive to a directory on a substituted drive";
windowsDict[140]= "The system tried to join a drive to a directory on a substituted drive";
windowsDict[141]= "The system tried to SUBST a drive to a directory on a joined drive";
windowsDict[142]= "The system cannot perform a JOIN or SUBST at this time";
windowsDict[143]= "The system cannot join or substitute a drive to or for a directory on the same drive";
windowsDict[144]= "The directory is not a subdirectory of the root directory";
windowsDict[145]= "The directory is not empty";
windowsDict[146]= "The path specified is being used in a substitute";
windowsDict[147]= "Not enough resources are available to process this command";
windowsDict[148]= "The path specified cannot be used at this time";
windowsDict[149]= "An attempt was made to join or substitute a drive for which a directory on the drive is the target of a previous substitute";
windowsDict[150]= "System trace information was not specified in your CONFIG.SYS file, or tracing is disallowed";
windowsDict[151]= "The number of specified semaphore events for DosMuxSemWait is not correct";
windowsDict[152]= "DosMuxSemWait did not execute; too many semaphores are already set";
windowsDict[153]= "The DosMuxSemWait list is not correct";
windowsDict[154]= "The volume label you entered exceeds the label character limit of the target file system";
windowsDict[155]= "Cannot create another thread";
windowsDict[156]= "The recipient process has refused the signal";
windowsDict[157]= "The segment is already discarded and cannot be locked";
windowsDict[158]= "The segment is already unlocked";
windowsDict[159]= "The address for the thread ID is not correct";
windowsDict[160]= "One or more arguments are not correct";
windowsDict[161]= "The specified path is invalid";
windowsDict[162]= "A signal is already pending";
windowsDict[170]= "The requested resource is in use";
windowsDict[173]= "A lock request was not outstanding for the supplied cancel region";
windowsDict[174]= "The file system does not support atomic changes to the lock type";
windowsDict[180]= "The system detected a segment number that was not correct";
windowsDict[183]= "Cannot create a file when that file already exists";
windowsDict[186]= "The flag passed is not correct";
windowsDict[187]= "The specified system semaphore name was not found";
windowsDict[196]= "The operating system cannot run this application program";
windowsDict[197]= "The operating system is not presently configured to run this application";
windowsDict[199]= "The operating system cannot run this application program";
windowsDict[200]= "The code segment cannot be greater than or equal to 64K";
windowsDict[203]= "The system could not find the environment option that was entered";
windowsDict[205]= "No process in the command subtree has a signal handler";
windowsDict[206]= "The filename or extension is too long";
windowsDict[207]= "The ring 2 stack is in use";
windowsDict[208]= "The global filename characters, * or ?, are entered incorrectly or too many global filename characters are specified";
windowsDict[209]= "The signal being posted is not correct";
windowsDict[210]= "The signal handler cannot be set";
windowsDict[212]= "The segment is locked and cannot be reallocated";
windowsDict[214]= "Too many dynamic-link modules are attached to this program or dynamic-link module";
windowsDict[215]= "Cannot nest calls to LoadModule";
windowsDict[230]= "The pipe state is invalid";
windowsDict[231]= "All pipe instances are busy";
windowsDict[232]= "The pipe is being closed";
windowsDict[233]= "No process is on the other end of the pipe";
windowsDict[234]= "More data is available";
windowsDict[240]= "The session was canceled";
windowsDict[254]= "The specified extended attribute name was invalid";
windowsDict[255]= "The extended attributes are inconsistent";
windowsDict[258]= "The wait operation timed out";
windowsDict[259]= "No more data is available";
windowsDict[266]= "The copy functions cannot be used";
windowsDict[267]= "The directory name is invalid";
windowsDict[275]= "The extended attributes did not fit in the buffer";
windowsDict[276]= "The extended attribute file on the mounted file system is corrupt";
windowsDict[277]= "The extended attribute table file is full";
windowsDict[278]= "The specified extended attribute handle is invalid";
windowsDict[282]= "The mounted file system does not support extended attributes";
windowsDict[288]= "Attempt to release mutex not owned by caller";
windowsDict[298]= "Too many posts were made to a semaphore";
windowsDict[299]= "Only part of a ReadProcessMemory or WriteProcessMemory request was completed";
windowsDict[300]= "The oplock request is denied";
windowsDict[301]= "An invalid oplock acknowledgment was received by the system";
windowsDict[302]= "The volume is too fragmented to complete this operation";
windowsDict[303]= "The file cannot be opened because it is in the process of being deleted. windowsDict[]="