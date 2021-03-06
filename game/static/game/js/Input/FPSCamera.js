function FPSCamera()
{
    this.cameraPitch = 0;
    this.cameraYaw = 0;
    this.targetTile = null;
    this.hoverMesh = null;
    this.placeDistance = 6;

    this.initFPSCamera =
    function initFPSCamera()
    {
        var geometry = new THREE.CubeGeometry(1.01, 1.01, 1.01);
        var material = new THREE.MeshBasicMaterial({color: 0xFF0000, transparent: true, opacity: 0.25});
        this.hoverMesh = new THREE.Mesh(geometry, material);
        scene.add(this.hoverMesh);
    }

    this.onMouseMove =
    function onMouseMove(e)
    {
        var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        var movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

    	FPSCamera.cameraYaw -= movementX * MouseUtil.sensitivity;
    	FPSCamera.cameraPitch -= movementY * MouseUtil.sensitivity;

    	//Clamp pitch
    	FPSCamera.cameraPitch = Math.min(Math.max(FPSCamera.cameraPitch, -90), 90);
    }

    this.zoom =
    function zoom()
    {
        camera.zoom = 4;
    }

    this.unZoom =
    function unZoom()
    {
        camera.zoom = 1;
    }

    this.updateCamera =
    function updateCamera()
    {
        camera.position.x = TimeManager.interpolate(thePlayer.prevX, thePlayer.x);
        camera.position.y = TimeManager.interpolate(thePlayer.prevY, thePlayer.y) + 1.75;
        camera.position.z = TimeManager.interpolate(thePlayer.prevZ, thePlayer.z);

        camera.rotation.x = MathUtil.toRadians(FPSCamera.cameraPitch);
        camera.rotation.y = MathUtil.toRadians(FPSCamera.cameraYaw);
        camera.rotation.z = 0;

        thePlayer.pitch = FPSCamera.cameraPitch;
        thePlayer.yaw = FPSCamera.cameraYaw + 90;

        this.targetTile = this.getTileLookingAt();
        if(this.targetTile != null)
        {
			var tile = Tiles.getTile(World.getTileAt(this.targetTile.x, this.targetTile.y, this.targetTile.z));
            var aabb = tile.normalizedRenderBox;

            this.hoverMesh.visible = true;
			this.hoverMesh.scale.x = aabb.x2 - aabb.x;
            this.hoverMesh.scale.y = aabb.y2 - aabb.y;
            this.hoverMesh.scale.z = aabb.z2 - aabb.z;

            this.hoverMesh.position.set(this.targetTile.x + aabb.x + this.hoverMesh.scale.x / 2, this.targetTile.y + aabb.y + this.hoverMesh.scale.y / 2, this.targetTile.z + aabb.z + this.hoverMesh.scale.z / 2);
        }
        else
        {
            this.hoverMesh.visible = false;
        }
    }

    this.getTileLookingAt =
    function getTileLookingAt()
    {
        //Calculate look angle
        var lookAngleX = -Math.sin(MathUtil.toRadians(FPSCamera.cameraYaw)) * Math.cos(MathUtil.toRadians(FPSCamera.cameraPitch));
        var lookAngleY = Math.sin(MathUtil.toRadians(FPSCamera.cameraPitch));
        var lookAngleZ = -Math.cos(MathUtil.toRadians(FPSCamera.cameraYaw)) * Math.cos(MathUtil.toRadians(FPSCamera.cameraPitch));

        //Get tiles in range
        var nearestIntersect = null;
        var minDistance = 100000;
        var tiles = new AABB(camera.position.x, camera.position.y, camera.position.z, camera.position.x, camera.position.y, camera.position.z).expandBox(lookAngleX * this.placeDistance, lookAngleY * this.placeDistance, lookAngleZ * this.placeDistance).tilesInBox(false);
        for(var i = 0, length = tiles.length; i < length; i++)
        {
            var x = tiles[i][1];
            var y = tiles[i][2];
            var z = tiles[i][3];
            var tile = tiles[i][0];
            var aabb = tile.getRenderAABB(x, y, z);

            var intersect = aabb.intersectLine(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z), new THREE.Vector3(camera.position.x + lookAngleX * this.placeDistance, camera.position.y + lookAngleY * this.placeDistance, camera.position.z + lookAngleZ * this.placeDistance));
            if(intersect.normal != null)
            {
                var distance = camera.position.distanceTo(intersect.intersect);
                if(distance < minDistance)
                {
                    minDistance = distance;
                    nearestIntersect = {"x": x, "y": y, "z": z, "normal": intersect.normal};
                }
            }
        }
        return nearestIntersect;
    }

    this.move =
    function move(key)
    {
        var forward = key == "z" ? 1 : (key == "s" ? -1 : 0);
        var strafe = key == "d" ? 1 : (key == "q" ? -1 : 0);

        FPSCamera.moveFromForce(forward, strafe);
    }

    this.moveFromForce =
    function moveFromForce(forward, strafe)
    {
        thePlayer.inputMotX += ((Math.sin(MathUtil.toRadians(FPSCamera.cameraYaw + 90)) * strafe) - (Math.sin(MathUtil.toRadians(FPSCamera.cameraYaw)) * forward)) * 0.15;
        thePlayer.inputMotZ += ((Math.cos(MathUtil.toRadians(FPSCamera.cameraYaw + 90)) * strafe) - (Math.cos(MathUtil.toRadians(FPSCamera.cameraYaw)) * forward)) * 0.15;
    }

    this.fly =
    function fly(key, ev)
    {
        if(thePlayer.fly)
        {
            thePlayer.inputMotY += (key == " " ? 1 : (key == "shift" ? -1 : 0)) * 0.3;
        }
        else if(key == " ")
        {
            thePlayer.jump();
        }
    }

    this.chooseTile =
    function chooseTile(direction, ev)
    {
        thePlayer.handIndex = (thePlayer.handIndex + direction) % 10;
        if(thePlayer.handIndex == -1)
        {
            thePlayer.handIndex = 9;
        }
    }

    this.pickTile =
    function pickTile(key, ev)
    {
        if(FPSCamera.targetTile != null)
        {
            var tX = FPSCamera.targetTile.x;
            var tY = FPSCamera.targetTile.y;
            var tZ = FPSCamera.targetTile.z;

            var tileAt = World.getTileAt(tX, tY, tZ);
            if(tileAt != 0)
            {
                thePlayer.inventory[thePlayer.handIndex] = tileAt;
            }
        }
    }

    this.placeTile =
    function placeTile(key, ev)
    {
        var place = key == "mouse-0";

        if(FPSCamera.targetTile != null)
        {
            var tX = FPSCamera.targetTile.x;
            var tY = FPSCamera.targetTile.y;
            var tZ = FPSCamera.targetTile.z;

            if(place)
            {
                tX += FPSCamera.targetTile.normal[0];
                tY += FPSCamera.targetTile.normal[1];
                tZ += FPSCamera.targetTile.normal[2];

                if(tY >= 255)
                {
                    return;
                }

                //Check block is air
                var tileAt = World.getTileAt(tX, tY, tZ);
                var tile = thePlayer.inventory[thePlayer.handIndex];
                if(tileAt == 0 && tile != null)
                {
                    var tileAABB = Tiles.getTile(tile).getAABB(tX, tY, tZ);

                    //Check players collision
                    var collided = false;
                    for(var i = 0, length = Entities.entityList.length; i < length; i++)
                    {
                        if(Entities.entityList[i].collision.intersect(tileAABB))
                        {
                            collided = true;
                            break;
                        }
                    }

                    if(!collided)
                    {
                        World.setTileAt(tile, tX, tY, tZ);

                        if(!offlineMode)
                        {
                            PacketsUtil.sendPacket(new PacketPlaceTile(tX, tY, tZ, tile));
                        }
                    }
                }
            }
            else
            {
                var tile = Tiles.getTile(World.getTileAt(tX, tY, tZ));
                if(!tile.unbreakable)
                {
                    //Break
                    World.setTileAt(0, tX, tY, tZ);

                    if(!offlineMode)
                    {
                        PacketsUtil.sendPacket(new PacketPlaceTile(tX, tY, tZ, 0));
                    }
                }
            }
        }
    }
}

var FPSCamera = new FPSCamera();
